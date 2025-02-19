// src/entity/Customers.ts
import Realm from 'realm';

export class Customer extends Realm.Object {
  id!: number;
  name!: string;
  line!: string;
  balance!: number;

  static schema = {
    name: 'Customer',
    primaryKey: 'id',
    properties: {
      id: 'int',
      name: 'string',
      line: 'string',
      balance: 'double',
    },
  };
}