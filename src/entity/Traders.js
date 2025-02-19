import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import BillsOut from './BillsOut';

class Traders extends Model {}

Traders.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  balance: {
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
  modelName: 'Traders',
  tableName: 'traders',
  timestamps: false,
});

// Associations
Traders.hasMany(BillsOut, { foreignKey: 'trader_id' });

export default Traders;
