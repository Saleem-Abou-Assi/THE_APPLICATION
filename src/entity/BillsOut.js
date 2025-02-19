import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Traders from './Traders';
import Payment from './Payment';
import Items from './Items';

class BillsOut extends Model {}

BillsOut.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  total_cost: {
    type: DataTypes.DECIMAL,
  },
  pay: {
    type: DataTypes.DECIMAL,
  },
  old_balance: {
    type: DataTypes.DECIMAL,
  },
  new_balance: {
    type: DataTypes.DECIMAL,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'BillsOut',
  tableName: 'bills_out',
  timestamps: false,
});

// Associations
BillsOut.belongsTo(Traders, { foreignKey: 'trader_id' });
BillsOut.hasOne(Payment, { foreignKey: 'bill_out_id' });
BillsOut.belongsToMany(Items, { through: 'item_bill_out', foreignKey: 'bill_out_id' });

export default BillsOut;
