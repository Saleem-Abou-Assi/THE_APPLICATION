import { Model, DataTypes } from 'sequelize';
import sequelize from '../database'; // Adjust the import based on your database setup
import Customers from './Customers';
import Income from './Income';
import Items from './Items';

class BillsIn extends Model {}

BillsIn.init({
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
  modelName: 'BillsIn',
  tableName: 'bills_in',
  timestamps: false,
});

// Associations
BillsIn.belongsTo(Customers, { foreignKey: 'customer_id' });
BillsIn.hasOne(Income, { foreignKey: 'bill_in_id' });
BillsIn.belongsToMany(Items, { through: 'item_bill_in', foreignKey: 'bill_in_id' });

export default BillsIn;
