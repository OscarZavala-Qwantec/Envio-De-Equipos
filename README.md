# Workera · Gestión de Envíos

Aplicación web ligera para registrar clientes y administrar sus envíos desde una sola ficha.

## Flujo práctico

1. Crear el cliente usando únicamente **RUC, razón social y contacto**.
2. Abrir su ficha y agregar uno o varios envíos.
3. En cada envío registrar **fecha, serie, tracking, PDF y observación**.
4. La fecha se muestra automáticamente en el calendario.
5. El calendario se puede filtrar por **RUC, razón social, contacto, serie o tracking**.

## Funciones

- Validación de RUC de 11 dígitos y prevención de RUC duplicados.
- Historial completo dentro de cada cliente.
- Adjuntos PDF con vista en otra pestaña.
- Calendario mensual con varios envíos por día.
- Buscadores rápidos en Clientes y Calendario.
- Diseño responsive para computadora y celular.
- Persistencia de prueba mediante `localStorage`.

## Importante sobre los PDF

Esta versión guarda el PDF en el navegador para facilitar la prueba, con límite de 4 MB por archivo. Los datos no se comparten entre computadoras o navegadores. Para uso real multiusuario se debe integrar Firebase Authentication, Firestore y Firebase Storage.
