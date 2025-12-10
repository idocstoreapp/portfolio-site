# Solución: GitHub Desktop solo muestra README

## Problema
Cuando agregas el repositorio en GitHub Desktop, solo aparece el README y no los demás archivos.

## Solución

### Opción 1: Usar GitHub Desktop (Recomendado)

1. **Cierra GitHub Desktop completamente** (cierra la aplicación)

2. **Abre GitHub Desktop nuevamente**

3. **File → Add Local Repository**
   - Navega a: `C:\Users\muebl\Documents\portfolio-site`
   - Selecciona la carpeta
   - Click en "Add"

4. **Si aún solo muestra README:**
   - Ve a la pestaña "History" en GitHub Desktop
   - Deberías ver todos los commits (portfolio556765, proyecto nuevo, COMPLETO, etc.)
   - Si ves los commits, los archivos están ahí, solo necesitas hacer push

5. **Crear el nuevo repositorio en GitHub:**
   - Ve a GitHub.com y crea un nuevo repositorio (sin inicializar)
   - Copia la URL del repositorio

6. **En GitHub Desktop:**
   - Click en "Publish repository" o "Repository → Repository Settings"
   - En "Remote", agrega la URL del nuevo repositorio
   - Click en "Push origin" o "Publish branch"

### Opción 2: Usar Terminal (Más rápido)

Si GitHub Desktop sigue dando problemas, usa la terminal:

```bash
# 1. Agregar el nuevo repositorio como remoto
git remote add origin https://github.com/TU-USUARIO/NUEVO-REPO.git

# 2. Verificar
git remote -v

# 3. Hacer push de todos los commits
git push -u origin main
```

### Opción 3: Forzar actualización en GitHub Desktop

1. En GitHub Desktop, ve a **Repository → Repository Settings**
2. Click en **"Remove"** en la sección Remote (si hay uno)
3. Cierra GitHub Desktop
4. Abre GitHub Desktop nuevamente
5. Agrega el repositorio local de nuevo

## Verificar que los archivos están en Git

Ejecuta en la terminal:

```bash
# Ver todos los archivos rastreados
git ls-files | wc -l

# Ver el último commit
git log --oneline -1

# Ver qué archivos están en el último commit
git show --name-only HEAD
```

Si ves muchos archivos, entonces están en Git y el problema es solo de visualización en GitHub Desktop.

## Estado Actual

✅ Todos los archivos están commiteados
✅ Repositorio desconectado del remoto anterior
✅ Listo para conectar a nuevo repositorio

