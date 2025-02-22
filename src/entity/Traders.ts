import Realm from 'realm';

export class Traders extends Realm.Object {
  id!: number;
  name!: string;
  balance!: number;

  static schema = {
    name: 'Traders',
    primaryKey: 'id',
    properties: {
      id: 'int',
      name: 'string',
      balance: 'double',
    },
  };
}
export default Traders;
