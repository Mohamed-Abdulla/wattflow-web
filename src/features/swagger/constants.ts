/** Maps each service to its Swagger UI path */
export const SWAGGER_SERVICES = [
  {
    id: "central-hub",
    label: "All Services (Central Hub)",
    path: "/swagger-internal",
    color: "primary",
  },
  {
    id: "user-service",
    label: "User Service",
    path: "/user-service/swagger-ui/index.html",
    color: "blue",
  },
  {
    id: "device-service",
    label: "Device Service",
    path: "/device-service/swagger-ui/index.html",
    color: "violet",
  },
  {
    id: "ingestion-service",
    label: "Ingestion Service",
    path: "/ingestion-service/swagger-ui/index.html",
    color: "amber",
  },
  {
    id: "usage-service",
    label: "Usage Service",
    path: "/usage-service/swagger-ui/index.html",
    color: "emerald",
  },
] as const;

export type SwaggerServiceId = (typeof SWAGGER_SERVICES)[number]["id"];
