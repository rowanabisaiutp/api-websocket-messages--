# Contact Messages CRUD API

Una API REST completa para gestionar mensajes de contacto con operaciones CRUD usando Node.js, Express y MySQL.

## Características

- ✅ Crear mensajes de contacto
- ✅ Leer todos los mensajes
- ✅ Leer mensaje por ID
- ✅ Actualizar mensajes existentes
- ✅ Eliminar mensajes
- ✅ Buscar mensajes por email
- ✅ Validación de datos
- ✅ Manejo de errores
- ✅ CORS habilitado

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp example.env .env
```

3. Editar el archivo `.env` con tus credenciales de base de datos:
```
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=tu_base_de_datos
DB_PORT=3306
PORT=3000
```

4. Crear la tabla en tu base de datos MySQL:
```sql
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);
```

## Uso

### Iniciar el servidor:
```bash
npm start
```

### Modo desarrollo (con nodemon):
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints de la API

### 1. Obtener todos los mensajes
```
GET /api/contacts
```

### 2. Obtener mensaje por ID
```
GET /api/contacts/:id
```

### 3. Crear nuevo mensaje
```
POST /api/contacts
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "subject": "Consulta sobre productos",
  "message": "Hola, me interesa saber más sobre..."
}
```

### 4. Actualizar mensaje
```
PUT /api/contacts/:id
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "subject": "Consulta actualizada",
  "message": "Mensaje actualizado..."
}
```

### 5. Eliminar mensaje
```
DELETE /api/contacts/:id
```

### 6. Buscar mensajes por email
```
GET /api/contacts/email/:email
```

### 7. Health check
```
GET /health
```

## Estructura del proyecto

```
├── config/
│   └── database.js      # Configuración de la base de datos
├── models/
│   └── Contact.js       # Modelo de datos para contactos
├── routes/
│   └── contacts.js      # Rutas de la API
├── server.js            # Servidor principal
├── package.json         # Dependencias del proyecto
├── example.env          # Variables de entorno de ejemplo
└── README.md           # Este archivo
```

## Respuestas de la API

Todas las respuestas siguen este formato:

### Éxito:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

### Error:
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles del error (solo en desarrollo)"
}
```

## Ejemplos de uso con cURL

### Crear un mensaje:
```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María García",
    "email": "maria@example.com",
    "subject": "Soporte técnico",
    "message": "Necesito ayuda con mi cuenta"
  }'
```

### Obtener todos los mensajes:
```bash
curl http://localhost:3000/api/contacts
```

### Actualizar un mensaje:
```bash
curl -X PUT http://localhost:3000/api/contacts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María García",
    "email": "maria@example.com",
    "subject": "Soporte técnico - URGENTE",
    "message": "Necesito ayuda inmediata con mi cuenta"
  }'
```

### Eliminar un mensaje:
```bash
curl -X DELETE http://localhost:3000/api/contacts/1
```
