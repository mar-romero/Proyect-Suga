# Suga - Sistema de Gestión de Suscripciones

## Descripción del Proyecto

Suga es un sistema diseñado para gestionar suscripciones de usuarios de manera eficiente y escalable. Este proyecto implementa una arquitectura moderna basada en **Hexagonal Architecture** y **Vertical Slicing**, utilizando tecnologías como **Node.js**, **MongoDB**, **Docker**, y **Kubernetes**. Además, se han implementado medidas de seguridad avanzadas, como **Rate Limiting**, sanitización de entradas y autenticación basada en **JWT**.

---

## Tabla de Contenidos

- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías Utilizadas y Justificación](#tecnologías-utilizadas-y-justificación)
- [Seguridad](#seguridad)
- [Pruebas](#pruebas)
- [Cómo Ejecutar el Proyecto](#cómo-ejecutar-el-proyecto)
- [Cómo Desplegar el Proyecto](#cómo-desplegar-el-proyecto)


---

## Arquitectura del Proyecto

### **Hexagonal Architecture**
La arquitectura hexagonal (también conocida como arquitectura de puertos y adaptadores) se utilizó para desacoplar la lógica de negocio del resto de la aplicación. Esto permite que el núcleo de la aplicación sea independiente de los detalles de infraestructura, como la base de datos o el framework web.

#### **Ventajas de Hexagonal Architecture**
1. **Desacoplamiento**: Facilita el cambio de tecnologías (por ejemplo, cambiar MongoDB por otra base de datos) sin afectar la lógica de negocio.
2. **Testabilidad**: La lógica de negocio puede probarse de manera aislada, sin depender de la infraestructura.
3. **Escalabilidad**: Permite agregar nuevos adaptadores (por ejemplo, APIs externas) sin modificar el núcleo de la aplicación.

### **Vertical Slicing**
Se utilizó **Vertical Slicing** para organizar el código por funcionalidades en lugar de capas tradicionales (controladores, servicios, repositorios). Cada módulo contiene todo lo necesario para una funcionalidad específica.

#### **Ventajas de Vertical Slicing**
1. **Modularidad**: Cada funcionalidad es independiente, lo que facilita el mantenimiento y la escalabilidad.
2. **Separación de responsabilidades**: Cada módulo tiene su propia lógica de negocio, infraestructura y API.
3. **Facilidad de desarrollo**: Los desarrolladores pueden trabajar en diferentes funcionalidades sin interferir entre sí.

---

## Estructura del Proyecto

La estructura del proyecto refleja los principios de **Hexagonal Architecture** y **Vertical Slicing**:

```
src/ 
├── app.js # Configuración principal de la aplicación 
├── container.js # Configuración de inyección de dependencias (Awilix) 
├── config/ # Configuración global 
│ ├── config.js # Variables de entorno y configuración 
│ └── logger.js # Configuración del logger 
├── database/ # Persistencia de datos 
│ ├── persistence/
│ │ ├──models/ Los modelos para la base de datos
│ │ ├── mongodb/
│ │ │ ├──base-repository.js # Repositorio Base para todos los repositorios
│ │ │ ├── connection.js # Conexión a MongoDB
│ │ │ ├── mongo-indexes.js
│ │ │ ├── mongo-monitoring.js
│ │ │ ├── mongo-customer.repository.js 
│ │ │ └── mongo-subscription.repository.js 
├── customer/ # Módulo de clientes 
│ ├── domain/ # Lógica de negocio 
│ ├── application/ # Casos de uso 
│ └── infrastructure/ # Controladores y rutas  
├── subscription/ # Módulo de suscripciones 
│ ├── domain/ 
│ ├── application/ 
│ └── infrastructure/
├── infrastructure/ # Infraestructura compartida 
│ └──  services/ # Servicios externos (Email, etc.) 
└── utils/ # Utilidades generales 
tests/ # Pruebas unitarias y de integración 
docker-compose.yml # Configuración de Docker Compose 
Dockerfile # Configuración de la imagen Docker

```

## Tecnologías Utilizadas y Justificación

### **MongoDB**
- **Por qué**: MongoDB es una base de datos NoSQL que permite almacenar datos en un formato flexible y eficiente. Aunque los datos se manejan como JSON en las aplicaciones, MongoDB los almacena internamente en **BSON** (Binary JSON), lo que permite una representación binaria más compacta y rápida.
- **Ventajas**:
  - **Escalabilidad horizontal**: MongoDB puede manejar grandes volúmenes de datos distribuidos.
  - **Índices avanzados**: Se configuraron índices para mejorar el rendimiento de las consultas (ver `mongo-indexes.js`).
  - **Monitoreo**: Se implementó monitoreo para detectar consultas lentas y colecciones grandes (ver `mongo-monitoring.js`).
  - **Eficiencia de almacenamiento**: Gracias a BSON, MongoDB puede almacenar tipos de datos adicionales como fechas y números binarios, que no están disponibles en JSON estándar.
    
### **Docker**
- **Por qué**: Docker permite contenerizar la aplicación, asegurando que se ejecute de manera consistente en cualquier entorno.
- **Ventajas**:
  - Portabilidad: La aplicación puede ejecutarse en cualquier máquina con Docker instalado.
  - Seguridad: Los contenedores se ejecutan con usuarios no root.

### **Kubernetes**
- **Por qué**: Kubernetes permite orquestar los contenedores y garantizar alta disponibilidad.
- **Ventajas**:
  - Escalado automático: Configuración de HPA (Horizontal Pod Autoscaler) para manejar picos de tráfico.
  - Gestión de secretos: Uso de `secrets.yaml` para almacenar claves sensibles.

### **Inyección de Dependencias (Awilix)**
- **Por qué**: Facilita la modularidad y el desacoplamiento del código.
- **Ventajas**:
  - Testabilidad: Los módulos pueden probarse de manera aislada.
  - Flexibilidad: Permite cambiar implementaciones sin modificar el código que las utiliza.

---

## Seguridad

1. **Rate Limiting**:
   - Implementado con un middleware para limitar el número de solicitudes por usuario.
   - Protege contra ataques de fuerza bruta y DDoS.

2. **Sanitización de Entradas**:
   - Uso de `express-mongo-sanitize` para prevenir inyecciones NoSQL.

3. **Autenticación y Autorización**:
   - Uso de **JWT** para autenticar y autorizar a los usuarios.
   - Los tokens tienen un tiempo de expiración configurable.

4. **Configuración de Docker y Kubernetes**:
   - Los contenedores se ejecutan con usuarios no root.
   - Uso de `secrets.yaml` para almacenar claves sensibles.

---

## Pruebas

### **Pruebas Unitarias**
- Se realizaron pruebas unitarias para los casos de uso principales (ver `tests/unit/subscription`).
- **Por qué solo pruebas unitarias**:
  - Son rápidas de ejecutar y fáciles de mantener.
  - Permiten probar la lógica de negocio de manera aislada.

---

## Cómo Ejecutar el Proyecto

### **Requisitos Previos**
- **Node.js** (v18 o superior)
- **Docker** y **Docker Compose**
- **Kubernetes** (opcional para despliegue en producción)

### **Pasos para Desarrollo**
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/suga.git
   cd suga

2. Instalar dependencias:
   ```bash
    npm install

3. Configurar las variables de entorno:
  - Copiar el archivo .env.example y configurarlo según tu entorno.

4. Ejecutar en desarrollo:
   ```bash
    npm run dev


## Cómo Desplegar el Proyecto
Con Docker
1. Construir y ejecutar los contenedores:
  ```bash
    docker-compose up --build
  ```


Con Kubernetes
1. Aplicar los manifiestos de Kubernetes:
  ```bash
    kubectl apply -f kubernetes/
  ```

2. Verificar el estado de los pods:

  ```bash
    kubectl get pods
  ```
