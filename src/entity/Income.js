import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Customers from './Customers';
import BillsIn from './BillsIn';

class Income extends Model {}

Income.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  amount: {
    type: DataTypes.DECIMAL,
  },
  note: {
    type: DataTypes.STRING,
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
  modelName: 'Income',
  tableName: 'income',
  timestamps: false,
});

// Associations
Income.belongsTo(Customers, { foreignKey: 'customer_id' });
Income.hasOne(BillsIn, { foreignKey: 'bill_in_id' });

export default Income;
