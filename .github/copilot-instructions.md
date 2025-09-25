# 🏦 GitHub Copilot Prompt: Web App Bancaria Educativa - "Cristian Bank"

## 🎯 Objetivo
Generar una aplicación web simulada de banca digital llamada **Cristian Bank**, destinada a prácticas de QA Automation. Esta app debe permitir realizar operaciones bancarias básicas y avanzadas, con gestión de usuarios, cuentas, y transacciones.

## 🛠️ Requisitos Técnicos

### 🌐 Hosting
- La aplicación debe ser **100% compatible con GitHub Pages**.
- Utilizar tecnologías que no requieran backend persistente en el servidor (ej. JAMstack).
- Lenguajes recomendados: React.
- Frameworks CSS recomendados: Bootstrap.


### 🗃️ Base de Datos
- Utilizar una **base de datos NoSQL simulada** (por ejemplo, **IndexedDB**, **localStorage**, o una librería como **lowdb**).
- Los datos deben persistir en el navegador y ser manipulables desde la interfaz.

### 👥 Usuarios
- Crear **20 usuarios predefinidos** con nombres, contraseñas y saldos iniciales.
- Crear **1 usuario administrador** con privilegios especiales:
  - Alta y baja de usuarios.
  - Modificación de saldos.
  - Visualización de cuentas en distintas monedas (USD, EUR, ARS).
  - Acceso a panel de control con métricas básicas.

### 💳 Funcionalidades Bancarias
- Login y logout con validación.
- Visualización de saldo por usuario.
- Transferencias entre cuentas.
- Conversión de monedas (simulada).
- Depósitos y retiros.
- Compra de monedas extranjeras con saldo disponible.--> utilizar apis existentes para tasas de cambio.
- Pago de servicios (simulado).
- Creación y gestión de tarjetas de crédito (simulado).
- Solicitud de préstamos (simulado).
- Visualización de movimientos recientes.
- Filtros y búsquedas en el historial de transacciones.
- Notificaciones de transacciones (simulado).
- Seguridad básica (ej. bloqueo tras 3 intentos fallidos de login solo puede desbloquear el usuario admin).
- Historial de transacciones.
- Panel de administración para el usuario admin.

### 🎨 Branding
- El banco se debe llamar **Cristian Bank**.
- Incluir un **logo personalizado** (puede ser SVG o PNG simulado).
- Estilo visual profesional pero accesible para fines educativos.

## 📦 Estructura del Proyecto
- Organizar el proyecto con una estructura clara (componentes, servicios, estilos, assets).
- Incluir un archivo `README.md` con instrucciones claras para correr la aplicación localmente y en GitHub Pages.

## 🧪 QA Automation Ready
- Incluir IDs y clases claras para facilitar testing automatizado.
- Simular respuestas y errores comunes (ej. login fallido, saldo insuficiente).
- Estructura modular para facilitar pruebas unitarias y end-to-end.

## 📄 Extras
- Documentar en README cómo iniciar la app desde GitHub Pages.
- Incluir instrucciones para extender funcionalidades (ej. agregar nuevos tipos de transacción).
