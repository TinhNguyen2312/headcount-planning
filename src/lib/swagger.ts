import { createSwaggerSpec } from "next-swagger-doc"

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "src/app/api",
    autoDoc: true,
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Headcount Planning API",
        version: "1.0.0",
        description: "",
      },
      servers: [
        {
          url: "",
          description: "Current Server",
        },
      ],
      components: {
        securitySchemes: {
          CookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "JSESSIONID",
            description: "",
          },
        },
      },
      security: [
        {
          CookieAuth: [],
        },
      ],
    },
  })
  return spec
}
