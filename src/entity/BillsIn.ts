// ... existing code ...
import Realm from 'realm';

export class BillsIn extends Realm.Object {
  id!: number;
  total_cost!: number;
  pay!: number;
  old_balance!: number;
  new_balance!: number;
  created_at!: Date;
  updated_at!: Date;

  static schema = {
    name: 'BillsOut',
    primaryKey: 'id',
    properties: {
      id: 'int',
      total_cost: 'double',
      pay: 'double',
      old_balance: 'double',
      new_balance: 'double',
      created_at: 'date',
      updated_at: 'date',
    },
  };
}
// ... existing code ...