# Si en producción no se ven los cambios (wizard, colores, etc.)

Si ya hiciste **commit** y **deploy** pero en producción sigues viendo la versión antigua (por ejemplo el wizard con colores viejos), casi siempre es **caché**.

## 1. Forzar un deploy sin caché en Vercel (recomendado)

1. Entra a [Vercel Dashboard](https://vercel.com) → tu proyecto.
2. Pestaña **Deployments**.
3. En el último deployment, clic en los **tres puntos (⋯)**.
4. Elige **Redeploy**.
5. **Marca la opción "Clear build cache"** (o "Use existing build cache" desmarcada, según cómo lo muestre Vercel).
6. Confirma **Redeploy**.

Así Vercel hace una build desde cero y el JS/CSS del wizard (y el HTML) serán los nuevos.

## 2. Headers de caché (ya configurados)

En la raíz del proyecto hay un **`vercel.json`** que pone `Cache-Control: public, max-age=0, must-revalidate` para la ruta **`/`**. Así, cada vez que alguien entra a la home, se revalida el HTML y se sirve la versión actual (y los nuevos archivos `_astro/*` con hash distinto).

Después de un **Redeploy con "Clear build cache"**, los usuarios deberían ver ya los cambios. Si en el celular sigues viendo lo viejo, prueba:

- Cerrar la pestaña y abrir de nuevo la URL.
- O abrir la URL en **modo incógnito** (para evitar caché del navegador).

## 3. Comprobar que el deploy tiene tu último commit

En Vercel → **Deployments** → clic en el deployment más reciente. Ahí debe aparecer el **commit** y el **mensaje** que corresponde a tus cambios. Si el deployment es de un commit anterior, el problema era que no se había desplegado el último código; en ese caso un nuevo deploy (o redeploy con caché limpia) lo arregla.
