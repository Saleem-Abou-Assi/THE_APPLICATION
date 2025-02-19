import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import BillsOut from './BillsOut';
import BillsIn from './BillsIn';

class Items extends Model {}

Items.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  b_price: {
    type: DataTypes.DECIMAL,
  },
  s_price: {
    type: DataTypes.DECIMAL,
  },
  quantity: {
    type: DataTypes.INTEGER,
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
  modelName: 'Items',
  tableName: 'items',
  timestamps: false,
});

// Associations
Items.belongsToMany(BillsIn, { through: 'item_bill_in', foreignKey: 'item_id' });
Items.belongsToMany(BillsOut, { through: 'item_bill_out', foreignKey: 'item_id' });

export default Items;
