/* eslint-disable no-param-reassign */
import './global-types';
import { GraphQLSchema } from 'graphql';
import SchemaBuilder, {
  BasePlugin,
  GiraphQLEnumValueConfig,
  GiraphQLInputFieldConfig,
  GiraphQLOutputFieldConfig,
  GiraphQLTypeConfig,
  SchemaTypes,
} from '@giraphql/core';
import mockAst from './mock-ast';
import { DirectiveList } from './types';

export * from './types';

const pluginName = 'directives' as const;

export default pluginName;
export class GiraphQLDirectivesPlugin<Types extends SchemaTypes> extends BasePlugin<Types> {
  override onOutputFieldConfig(fieldConfig: GiraphQLOutputFieldConfig<Types>) {
    const options = fieldConfig.giraphqlOptions;

    if (!options.directives && !fieldConfig.extensions?.directives) {
      return fieldConfig;
    }

    return {
      ...fieldConfig,
      extensions: {
        ...fieldConfig.extensions,
        directives: this.normalizeDirectives(
          this.mergeDirectives(
            fieldConfig.extensions?.directives as Record<string, {}>,
            options.directives as unknown as Record<string, {}>,
          ),
        ),
      },
    };
  }

  override onInputFieldConfig(fieldConfig: GiraphQLInputFieldConfig<Types>) {
    const options = fieldConfig.giraphqlOptions;

    if (!options.directives) {
      return fieldConfig;
    }

    return {
      ...fieldConfig,
      extensions: {
        ...fieldConfig.extensions,
        directives: this.normalizeDirectives(
          this.mergeDirectives(
            fieldConfig.extensions?.directives as Record<string, {}>,
            options.directives as unknown as Record<string, {}>,
          ),
        ),
      },
    };
  }

  override onEnumValueConfig(valueConfig: GiraphQLEnumValueConfig<Types>) {
    const options = valueConfig.giraphqlOptions;

    if (!options.directives) {
      return valueConfig;
    }

    return {
      ...valueConfig,
      extensions: {
        ...valueConfig.extensions,
        directives: this.normalizeDirectives(
          this.mergeDirectives(
            valueConfig.extensions?.directives as Record<string, {}>,
            options.directives as unknown as Record<string, {}>,
          ),
        ),
      },
    };
  }

  override onTypeConfig(typeConfig: GiraphQLTypeConfig) {
    const options = typeConfig.giraphqlOptions;

    if (!options.directives) {
      return typeConfig;
    }

    return {
      ...typeConfig,
      extensions: {
        ...typeConfig.extensions,
        directives: this.normalizeDirectives(
          this.mergeDirectives(
            typeConfig.extensions?.directives as Record<string, {}>,
            options.directives as unknown as Record<string, {}>,
          ),
        ),
      },
    };
  }

  override afterBuild(schema: GraphQLSchema) {
    mockAst(schema);

    return schema;
  }

  mergeDirectives(
    left: DirectiveList | Record<string, {}>,
    right: DirectiveList | Record<string, {}>,
  ) {
    if (!(left && right)) {
      return left || right;
    }

    return [
      ...(Array.isArray(left)
        ? left
        : Object.keys(left).map((name) => ({ name, args: left[name] }))),
      ...(Array.isArray(right)
        ? right
        : Object.keys(right).map((name) => ({ name, args: right[name] }))),
    ];
  }

  normalizeDirectives(directives: DirectiveList | Record<string, {}>) {
    if (this.builder.options.useGraphQLToolsUnorderedDirectives) {
      if (!Array.isArray(directives)) {
        return directives;
      }

      // eslint-disable-next-line unicorn/prefer-object-from-entries
      return directives.reduce<Record<string, {}[]>>((obj, directive) => {
        if (obj[directive.name]) {
          obj[directive.name].push(directive.args ?? {});
        } else {
          obj[directive.name] = [directive.args ?? {}];
        }

        return obj;
      }, {});
    }

    if (Array.isArray(directives)) {
      return directives;
    }

    return Object.keys(directives).map((name) => ({ name, args: directives[name] }));
  }
}

SchemaBuilder.registerPlugin(pluginName, GiraphQLDirectivesPlugin);
