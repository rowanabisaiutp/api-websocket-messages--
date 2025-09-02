-- Datos de ejemplo para la tabla contact_messages

-- Insertar mensajes de contacto de ejemplo
INSERT INTO contact_messages (name, email, subject, message) VALUES
('Juan Pérez', 'juan.perez@email.com', 'Consulta sobre productos', 'Hola, me interesa saber más información sobre sus productos y servicios. ¿Podrían contactarme?'),

('María García', 'maria.garcia@empresa.com', 'Soporte técnico', 'Necesito ayuda con mi cuenta. No puedo acceder a la plataforma desde ayer.'),

('Carlos López', 'carlos.lopez@gmail.com', 'Propuesta de colaboración', 'Somos una empresa interesada en establecer una alianza comercial. ¿Podríamos agendar una reunión?'),

('Ana Martínez', 'ana.martinez@hotmail.com', 'Información de precios', 'Buenos días, me gustaría recibir información detallada sobre los precios de sus servicios.'),

('Roberto Silva', 'roberto.silva@yahoo.com', 'Problema con facturación', 'He detectado un error en mi última factura. El monto no coincide con lo acordado.'),

('Laura Rodríguez', 'laura.rodriguez@outlook.com', 'Solicitud de cotización', 'Necesito una cotización para un proyecto que incluye 50 usuarios y 6 meses de servicio.'),

('Miguel Torres', 'miguel.torres@empresa.org', 'Feedback sobre el servicio', 'Quería felicitarlos por el excelente servicio. La atención al cliente ha sido excepcional.'),

('Sofía Herrera', 'sofia.herrera@universidad.edu', 'Consulta académica', 'Soy estudiante de ingeniería y me gustaría información sobre oportunidades de prácticas en su empresa.'),

('Diego Morales', 'diego.morales@startup.com', 'Partnership tecnológico', 'Tenemos una startup que podría complementar perfectamente sus servicios. ¿Les interesa conocer más?'),

('Valentina Cruz', 'valentina.cruz@consultora.com', 'Servicios de consultoría', 'Ofrecemos servicios de consultoría en digitalización. ¿Podríamos presentarles nuestra propuesta?');

-- Verificar que los datos se insertaron correctamente
SELECT COUNT(*) as total_messages FROM contact_messages;

-- Ver algunos mensajes recientes
SELECT id, name, email, subject, created_at 
FROM contact_messages 
ORDER BY created_at DESC 
LIMIT 5;
