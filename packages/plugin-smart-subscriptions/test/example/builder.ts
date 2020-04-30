import SchemaBuilder from '@giraphql/core';
import { ContextType } from './types';
import { Poll } from './data';
import SmartSubscriptionPlugin, { subscribeOptionsFromIterator } from '../../src';

interface TypeInfo {
  Object: {
    Poll: Poll;
    Answer: { id: number; value: string; count: number };
  };
  Context: ContextType;
  SmartSubscriptions: string;
}

export default new SchemaBuilder<TypeInfo>({
  plugins: [
    new SmartSubscriptionPlugin<ContextType>({
      ...subscribeOptionsFromIterator((name, { pubsub }) => {
        return pubsub.asyncIterator(name);
      }),
    }),
  ],
});