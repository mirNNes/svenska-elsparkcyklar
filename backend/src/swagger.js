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
      Station: {
        type: "object",
        properties: {
          id: { type: "number" },
          name: { type: "string" },
          cityId: { type: "string", description: "Mongo ObjectId" },
          location: {
            type: "object",
            properties: {
              lat: { type: "number" },
              lng: { type: "number" },
            },
          },
          capacity: { type: "number" },
          currentBikes: { type: "number" },
        },
      },
      ParkingZone: {
        type: "object",
        properties: {
          id: { type: "number" },
          name: { type: "string" },
          cityId: { type: "string", description: "Mongo ObjectId" },
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
      AllowedZone: {
        type: "object",
        properties: {
          id: { type: "number" },
          name: { type: "string" },
          cityId: { type: "string", description: "Mongo ObjectId" },
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
          username: { type: "string" },
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
          parkingType: { type: "string" },
          parkingFee: { type: "number" },
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
        summary: "Logga in (admin eller användare)",
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
    "/auth/signup": {
      post: {
        summary: "Skapa konto (roll: user)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" },
                  username: { type: "string" },
                },
                required: ["name", "email", "password"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Konto skapat",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                    access_token: { type: "string" },
                    refresh_token: { type: "string" },
                  },
                },
              },
            },
          },
          400: { description: "Fel indata" },
          409: { description: "E-post eller användarnamn upptaget" },
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
    "/bike/{id}/telemetry": {
      patch: {
        summary: "Uppdatera cykel-telemetri (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "number" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  location: {
                    type: "object",
                    properties: {
                      lat: { type: "number" },
                      lng: { type: "number" },
                    },
                  },
                  battery: { type: "number" },
                  isAvailable: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Uppdaterad" },
          400: { description: "Fel indata" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Hittades inte" },
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
    "/station": {
      get: {
        summary: "Lista alla laddstationer",
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Skapa laddstation (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Station" },
            },
          },
        },
        responses: {
          201: { description: "Skapad" },
          400: { description: "Fel indata" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/station/{id}": {
      get: {
        summary: "Hämta laddstation",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "number" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "Hittades inte" },
        },
      },
      patch: {
        summary: "Uppdatera laddstation (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "number" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Station" },
            },
          },
        },
        responses: {
          200: { description: "OK" },
          400: { description: "Fel indata" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Hittades inte" },
        },
      },
      delete: {
        summary: "Ta bort laddstation (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "number" } }],
        responses: {
          204: { description: "Borttagen" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Hittades inte" },
        },
      },
    },
    "/parking-zone": {
      get: {
        summary: "Lista alla parkeringszoner",
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Skapa parkeringszon (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ParkingZone" },
            },
          },
        },
        responses: {
          201: { description: "Skapad" },
          400: { description: "Fel indata" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/parking-zone/{id}": {
      get: {
        summary: "Hämta parkeringszon",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "number" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "Hittades inte" },
        },
      },
      patch: {
        summary: "Uppdatera parkeringszon (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "number" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ParkingZone" },
            },
          },
        },
        responses: {
          200: { description: "OK" },
          400: { description: "Fel indata" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Hittades inte" },
        },
      },
      delete: {
        summary: "Ta bort parkeringszon (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "number" } }],
        responses: {
          204: { description: "Borttagen" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Hittades inte" },
        },
      },
    },
    "/allowed-zone": {
      get: {
        summary: "Lista alla tillåtna zoner",
        responses: { 200: { description: "OK" } },
      },
      post: {
        summary: "Skapa tillåten zon (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AllowedZone" },
            },
          },
        },
        responses: {
          201: { description: "Skapad" },
          400: { description: "Fel indata" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/allowed-zone/{id}": {
      get: {
        summary: "Hämta tillåten zon",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "number" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "Hittades inte" },
        },
      },
      patch: {
        summary: "Uppdatera tillåten zon (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "number" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AllowedZone" },
            },
          },
        },
        responses: {
          200: { description: "OK" },
          400: { description: "Fel indata" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Hittades inte" },
        },
      },
      delete: {
        summary: "Ta bort tillåten zon (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "number" } }],
        responses: {
          204: { description: "Borttagen" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Hittades inte" },
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
    "/ride/{id}": {
      get: {
        summary: "Hämta resa",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "number" } }],
        responses: {
          200: { description: "OK" },
          404: { description: "Hittades inte" },
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
    "/bike/rent/{bikeId}/{userId}": {
      post: {
        summary: "Starta uthyrning av cykel (kräver auth)",
        parameters: [
          { name: "bikeId", in: "path", required: true, schema: { type: "number" } },
          { name: "userId", in: "path", required: true, schema: { type: "number" } },
        ],
        responses: {
          201: { description: "Uthyrning startad" },
          400: { description: "Fel indata" },
          404: { description: "Bike eller user saknas" },
        },
      },
    },
    "/bike/rent-leave/{rentId}": {
      post: {
        summary: "Avsluta uthyrning (kräver auth)",
        parameters: [{ name: "rentId", in: "path", required: true, schema: { type: "number" } }],
        responses: {
          200: { description: "Uthyrning avslutad" },
          400: { description: "Redan avslutad" },
          404: { description: "Hittades inte" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        summary: "Byt refresh-token mot nytt tokenpar",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { refresh_token: { type: "string" } },
                required: ["refresh_token"],
              },
            },
          },
        },
        responses: {
          200: { description: "Nytt tokenpar" },
          400: { description: "Saknar token" },
          401: { description: "Ogiltigt/spärrat token" },
        },
      },
    },
    "/auth/logout": {
      post: {
        summary: "Logga ut och spärrar refresh-token",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { refresh_token: { type: "string" } },
                required: ["refresh_token"],
              },
            },
          },
        },
        responses: {
          200: { description: "Utloggad" },
          400: { description: "Saknar token" },
        },
      },
    },
    "/user": {
      get: {
        summary: "Lista användare (admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "OK" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
      post: {
        summary: "Skapa användare (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/User" },
            },
          },
        },
        responses: {
          201: { description: "Skapad" },
          400: { description: "Fel indata" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
