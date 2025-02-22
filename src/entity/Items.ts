// src/entity/Items.ts
import Realm from 'realm';

export class Item extends Realm.Object {
  id!: number;
  name!: string;
  b_price!: number; // Assuming b_price is a number
  s_price!: number; // Assuming s_price is a number
  quantity!: number;

  static schema = {
    name: 'Item',
    primaryKey: 'id',
    properties: {
      id: 'int',
      name: 'string',
      b_price: 'double', // Change to 'double' for decimal values
      s_price: 'double', // Change to 'double' for decimal values
      quantity: 'int',
    },
  };
}