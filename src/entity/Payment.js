import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Traders from './Traders';
import BillsOut from './BillsOut';

class Payment extends Model {}

Payment.init({
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
  modelName: 'Payment',
  tableName: 'payment',
  timestamps: false,
});

// Associations
Payment.belongsTo(Traders, { foreignKey: 'trader_id' });
Payment.hasOne(BillsOut, { foreignKey: 'bill_out_id' });

export default Payment;
