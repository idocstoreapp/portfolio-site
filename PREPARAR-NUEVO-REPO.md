# Preparar Nuevo Repositorio de GitHub

Este proyecto ha sido desconectado del repositorio anterior (`jonacrd/portfolio-site`).

## Pasos para conectar a un nuevo repositorio:

### 1. Crear el nuevo repositorio en GitHub
- Ve a GitHub y crea un nuevo repositorio (público o privado)
- **NO** inicialices con README, .gitignore o licencia (ya tenemos estos archivos)

### 2. Conectar el repositorio local al nuevo remoto

Ejecuta estos comandos en la terminal (reemplaza `TU-USUARIO` y `NUEVO-REPO`):

```bash
# Agregar el nuevo repositorio como origin
git remote add origin https://github.com/TU-USUARIO/NUEVO-REPO.git

# Verificar que se agregó correctamente
git remote -v

# Hacer push al nuevo repositorio
git push -u origin main
```

### 3. Si el nuevo repositorio ya tiene commits

Si por alguna razón el nuevo repositorio ya tiene contenido, usa:

```bash
git remote add origin https://github.com/TU-USUARIO/NUEVO-REPO.git
git branch -M main
git push -u origin main --force
```

⚠️ **Nota**: El flag `--force` sobrescribe el historial remoto. Úsalo solo si estás seguro.

## Estado actual

- ✅ Repositorio local desconectado del remoto anterior
- ✅ Historial de commits local preservado
- ✅ Listo para conectar a un nuevo repositorio

## Verificar estado

```bash
# Ver remotes configurados
git remote -v

# Ver estado del repositorio
git status

# Ver historial de commits
git log --oneline
```


