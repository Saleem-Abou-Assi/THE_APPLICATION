import Realm from 'realm';
import { Customer } from './entity/Customers';

// Initialize Realm with the Customer schema
const realm = new Realm({
path: './myRealm.realm', // Specify a custom path
  schema: [Customer],
  schemaVersion: 1, // Increment this if you change the schema
});

// Function to get the Realm instance
export const getRealm = () => {
  return realm;
};

// Optional: Function to close the Realm instance (if needed)
export const closeRealm = () => {
  realm.close();
};

export default realm; // Export the realm instance for direct use if needed 