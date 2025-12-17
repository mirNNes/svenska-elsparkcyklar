// Enkel OpenAPI-spec för vårt API
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Svenska Elsparkcyklar API",
    version: "1.0.0",
    description:
      "API-dokumentation för backend. Uppdatera paths/scheman när nya endpoints läggs till.",
  },
  servers: [
    {
      url: "http://localhost:3001/api",
      description: "Lokal utveckling",
    },
  ],
  components: {
    schemas: {
      City: {
        type: "object",
        properties: {
          id: { type: "number" },
          name: { type: "string" },
          scootersAvailable: { type: "number" },
          center: {
            type: "object",
            properties: {
              lat: { type: "number" },
              lng: { type: "number" },
            },
          },
          radius: { type: "number" },
        },
      },
      Bike: {
        type: "object",
        properties: {
          id: { type: "number" },
          battery: { type: "number" },
          isAvailable: { type: "boolean" },
          cityId: { type: "string", description: "Mongo ObjectId" },
          location: {
            type: "object",
            properties: {
              lat: { type: "number" },
              lng: { type: "number" },
            },
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "number" },
          name: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["user", "admin"] },
        },
      },
      Ride: {
        type: "object",
        properties: {
          id: { type: "number" },
          bikeId: { type: "string" },
          userId: { type: "string" },
          startedAt: { type: "string", format: "date-time" },
          endedAt: { type: "string", format: "date-time", nullable: true },
          distance: { type: "number" },
          energyUsed: { type: "number" },
          price: { type: "number" },
        },
      },
      AuthTokens: {
        type: "object",
        properties: {
          access_token: { type: "string" },
          refresh_token: { type: "string" },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/auth/login": {
      post: {
        summary: "Logga in som admin",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Lyckad inloggning",
            content: {
              "application/json": {
                schema: {
                  allOf: [{ $ref: "#/components/schemas/AuthTokens" }],
                },
              },
            },
          },
          401: { description: "Fel inloggning" },
        },
      },
    },
    "/bike": {
      get: {
        summary: "Lista alla cyklar",
        responses: {
          200: {
            description: "Alla cyklar",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Bike" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Skapa cykel (kräver auth)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  cityId: { type: "string", description: "Mongo ObjectId" },
                },
                required: ["cityId"],
              },
            },
          },
        },
        responses: {
          201: { description: "Skapad" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/city": {
      get: {
        summary: "Lista alla städer",
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Skapa stad (kräver auth)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/City" },
            },
          },
        },
        responses: {
          201: { description: "Skapad" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/ride/start": {
      post: {
        summary: "Starta en resa (kräver auth)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  bikeId: { type: "number" },
                  userId: { type: "number" },
                },
                required: ["bikeId", "userId"],
              },
            },
          },
        },
        responses: {
          201: { description: "Ride startad" },
          400: { description: "Fel indata" },
        },
      },
    },
    "/ride/end": {
      post: {
        summary: "Stoppa resa (kräver auth)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { rideId: { type: "number" } },
                required: ["rideId"],
              },
            },
          },
        },
        responses: {
          200: { description: "Ride stoppad" },
          400: { description: "Fel indata" },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
