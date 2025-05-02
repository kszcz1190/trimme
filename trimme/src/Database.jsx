import { createRxDatabase, addRxPlugin } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import {
  serviceSchema,
  customerSchema,
  productSchema,
  employeesSchema,
  appointmentSchema,
} from "./Schema";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { RxDBLeaderElectionPlugin } from "rxdb/plugins/leader-election";
import { replicateFirestore } from "rxdb/plugins/replication-firestore"; // 🔥 Firestore Replication Plugin

import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration-schema";
addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBLeaderElectionPlugin);

// 🔥 Twoja konfiguracja Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDtnkjh78PFoHGC4mqtpZ7TfGicL-aogBU", // ❗ Zmień ten klucz po wygenerowaniu nowego!
  authDomain: "trimme-a4d36.firebaseapp.com",
  projectId: "trimme-a4d36",
  storageBucket: "trimme-a4d36.appspot.com",
  messagingSenderId: "545813124943",
  appId: "1:545813124943:web:your-app-id",
};

// 🔥 Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const firestoreDatabase = getFirestore(app);

// 🔥 Kolekcje Firestore (dopasowane do RxDB)
const servicesFirestoreCollection = collection(firestoreDatabase, "services");
const customersFirestoreCollection = collection(firestoreDatabase, "customers");
const productsFirestoreCollection = collection(firestoreDatabase, "products");
const employeesFirestoreCollection = collection(firestoreDatabase, "employees");
const appointmentSchemaFirestoreCollection = collection(
  firestoreDatabase,
  "appointments"
);
const employeesScheduleFirestoreCollection = collection(
  firestoreDatabase,
  "employeesSchedule"
);

let dbPromise = null;

const _create = async () => {
  console.log("DatabaseService: removing old database...");
  await indexedDB.deleteDatabase("trimme-database"); // Usunięcie starej bazy danych
  console.log("DatabaseService: creating database..");
  const db = await createRxDatabase({
    name: "trimme-database",
    storage: wrappedValidateAjvStorage({ storage: getRxStorageDexie() }),
  });
  console.log("DatabaseService: created database");
  window["db"] = db; // Debugowanie

  // 🔥 Tworzenie kolekcji w RxDB
  console.log("DatabaseService: create collections");
  await db.addCollections({
    services: { schema: serviceSchema, methods: {} },
    customers: { schema: customerSchema, methods: {} },
    products: { schema: productSchema, methods: {} },
    employees: { schema: employeesSchema, methods: {} },
    appointmentSchema: { schema: appointmentSchema, methods: {} },
    employeesSchedule: { schema: appointmentSchema, methods: {} },
  });


  // 🔄 Replikacja Firestore dla "services"
  console.log("DatabaseService: syncing with Firestore (services)");
  replicateFirestore({
    replicationIdentifier: "firestore-services-trimme",
    collection: db.collections.services,
    firestore: {
      projectId: "trimme-a4d36",
      database: firestoreDatabase,
      collection: servicesFirestoreCollection,
    },
    pull: {}, // Możesz dodać konfigurację
    push: {}, // Możesz dodać konfigurację
    live: true,
    serverTimestampField: "serverTimestamp",
  });

  // 🔄 Replikacja Firestore dla "customers"
  console.log("DatabaseService: syncing with Firestore (customers)");
  replicateFirestore({
    replicationIdentifier: "firestore-customers-trimme",
    collection: db.collections.customers,
    firestore: {
      projectId: "trimme-a4d36",
      database: firestoreDatabase,
      collection: customersFirestoreCollection,
    },
    pull: {}, // Możesz dodać konfigurację
    push: {}, // Możesz dodać konfigurację
    live: true,
    serverTimestampField: "serverTimestamp",
  });

  // 🔄 Replikacja Firestore dla "products"
  console.log("DatabaseService: syncing with Firestore (products)");
  replicateFirestore({
    replicationIdentifier: "firestore-products-trimme",
    collection: db.collections.products,
    firestore: {
      projectId: "trimme-a4d36",
      database: firestoreDatabase,
      collection: productsFirestoreCollection,
    },
    pull: {}, // Możesz dodać konfigurację
    push: {}, // Możesz dodać konfigurację
    live: true,
    serverTimestampField: "serverTimestamp",
  });

  // 🔄 Replikacja Firestore dla "employees"
  console.log("DatabaseService: syncing with Firestore (employees)");
  replicateFirestore({
    replicationIdentifier: "firestore-employees-trimme",
    collection: db.collections.employees,
    firestore: {
      projectId: "trimme-a4d36",
      database: firestoreDatabase,
      collection: employeesFirestoreCollection,
    },
    pull: {}, // Możesz dodać konfigurację
    push: {}, // Możesz dodać konfigurację
    live: true,
    serverTimestampField: "serverTimestamp",
  });

  // Replikacja Firestore dla "appointments"
  console.log("DatabaseService: syncing with Firestore (appointments)");
  replicateFirestore({
    replicationIdentifier: "firestore-appointments-trimme",
    collection: db.collections.appointmentSchema,
    firestore: {
      projectId: "trimme-a4d36",
      database: firestoreDatabase,
      collection: appointmentSchemaFirestoreCollection,
    },
    pull: {}, // Możesz dodać konfigurację
    push: {}, // Możesz dodać konfigurację
    live: true,
    serverTimestampField: "serverTimestamp",
  });

  // Replikacja Firestore dla "employeesSchedule"
  console.log("DatabaseService: syncing with Firestore (employeesSchedule)");
  replicateFirestore({
    replicationIdentifier: "firestore-employeesSchedule-trimme",
    collection: db.collections.employeesSchedule,
    firestore: {
      projectId: "trimme-a4d36",
      database: firestoreDatabase,
      collection: employeesScheduleFirestoreCollection,
    },
    pull: {}, // Możesz dodać konfigurację
    push: {}, // Możesz dodać konfigurację
    live: true,
    serverTimestampField: "serverTimestamp",
  });

  return db;
};

export const get = () => {
  if (!dbPromise) dbPromise = _create();
  return dbPromise;
};
export { firestoreDatabase };
