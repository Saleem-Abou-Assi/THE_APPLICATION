import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Items from './Items';
import BillsOut from './BillsOut';

class ItemBillOut extends Model {}

ItemBillOut.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  price: {
    type: DataTypes.DECIMAL,
  },
  quantity: {
    type: DataTypes.INTEGER,
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
  modelName: 'ItemBillOut',
  tableName: 'item_bill_out',
  timestamps: false,
});

// Associations
ItemBillOut.belongsTo(Items, { foreignKey: 'item_id' });
ItemBillOut.belongsTo(BillsOut, { foreignKey: 'bill_out_id' });

export default ItemBillOut;
