export const serviceSchema = {
  title: "service schema",
  description: "describes a simple service",
  version: 1,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 30,
    },
    name: {
      type: "string",
      maxLength: 100,
    },
    startPrice: {
      type: "number",
    },
    endPrice: {
      type: "number",
    },
    duration: {
      type: "number",
    },
    description: {
      type: "string",
      maxLength: 200,
    },
    _deleted: { type: "boolean" },
    _meta: {
      type: "object",
      properties: {
        lwt: {
          type: "number",
          multipleOf: 0.01,
          minimum: 1,
          maximum: 1000000000000000,
        },
      },
      required: ["lwt"],
    },
  },
  required: ["id","name", "startPrice", "endPrice", "duration"],
};

export const customerSchema = {
  title: "customer schema",
  description: "describes a simple customer",
  version: 2,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 30 },
    name: { type: "string", maxLength: 100 },
    surname: { type: "string", maxLength: 100 },
    phone: { type: "number" },
    _deleted: { type: "boolean" }, // 🔥 Dodane
    _meta: {
      type: "object",
      properties: {
        lwt: {
          type: "number",
          multipleOf: 0.01,
          minimum: 1,
          maximum: 1000000000000000,
        },
      },
      required: ["lwt"],
    },
  },
  required: ["id", "name", "surname", "phone", "_deleted", "_meta"],
};

export const productSchema = {
  title: "product schema",
  description: "describes a simple product",
  version: 1,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 30,
    },
    name: {
      type: "string",
      maxLength: 100,
    },
    description: {
      type: "string",
      maxLength: 200,
    },
    price: {
      type: "number",
    },
    capacity: {
      type: "number",
    },
    quantity: {
      type: "number",
    },
    _deleted: { type: "boolean" },
    _meta: {
      type: "object",
      properties: {
        lwt: {
          type: "number",
          multipleOf: 0.01,
          minimum: 1,
          maximum: 1000000000000000,
        },
      },
      required: ["lwt"],
    },
  },
  required: ["id", "name", "price"],
};

export const employeesSchema = {
  title: "employees schema",
  description: "describes a simple employee",
  version: 1,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 30,
    },
    name: {
      type: "string",
      maxLength: 100,
    },
    surname: {
      type: "string",
      maxLength: 100,
    },
    tel: {
      type: "number",
    },
    pesel: {
      type: "number",
    },
    address: {
      type: "string",
      maxLength: 100,
    },
    description: {
      type: "string",
      maxLength: 200,
    },
    supervisor: {
      type: "boolean",
    },
    //add photo of employee
    photoUrl: {
      type: "string",
      maxLength: 500,
    },
    color: {
      type: "string",
      maxLength: 100,
    },
  },
  required: ["id", "name", "surname", "tel"],
};

export const appointmentSchema = {
  title: "appointment schema",
  description: "describes a simple appointment",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 30,
    },
    start_date: {
      type: "string",
      maxLength: 30,
    },
    end_date: {
      type: "string",
      maxLength: 30,
    },
    service: {
      type: "string",
      maxLength: 100,
    },
    customer: {
      type: "string",
      maxLength: 100,
    },
    employee: {
      type: "string",
      maxLength: 100,
    },
    price: {
      type: "string",
      maxLength: 30,
    },
  },
  required: ["id", "start_date","end_date", "service", "customer", "employee", "price"],
};

export const employeeScheduleSchema = {
  title: "employee schedule schema",
  description: "describes a simple employee schedule",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 30,
    },
    employee_id: {
      type: "string",
      maxLength: 30,
    },
    employee_name: {
      type: "string",
      maxLength: 100,
    },
    start: {
      type: "string",
      maxLength: 30,
    },
    end: {
      type: "string",
      maxLength: 30,
    },
  },
  required: ["id", "employee_id", "employee_name", "start", "end"],
};
