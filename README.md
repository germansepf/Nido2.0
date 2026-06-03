# Nido — PWA Personal

Tu espacio personal: finanzas, agenda, hábitos, notas y humor. Funciona como app nativa instalable en el celular y en el navegador.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (Auth + PostgreSQL + Row Level Security)
- TanStack Query v5 (fetching & cache)
- Zustand (estado global)
- Recharts (gráficas de finanzas)
- next-themes (dark mode)
- lucide-react (iconos)

---

## 1. Configurar Supabase

### 1.1 Crear proyecto

1. Ir a [supabase.com](https://supabase.com) → crear nuevo proyecto
2. En **Project Settings → API**, copiar:
   - `Project URL`
   - `anon public` key

### 1.2 Ejecutar schema SQL

1. Abrir el proyecto en Supabase Dashboard
2. Ir a **SQL Editor**
3. Pegar el contenido de `supabase/schema.sql` y ejecutar

### 1.3 Crear usuario

1. Ir a **Authentication → Users**
2. Hacer clic en **Add user**
3. Ingresar email y contraseña

---

## 2. Variables de entorno

Editar `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

---

## 3. Instalar y ejecutar localmente

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## 4. Generar iconos PWA

1. Abrir `public/icons/generate-icons.html` en el navegador
2. Hacer clic en los 3 botones para descargar:
   - `icon-192x192.png`
   - `icon-512x512.png`
   - `apple-touch-icon.png`
3. Colocar los archivos descargados en `public/icons/`

---

## 5. Deploy en Vercel

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Deploy
vercel
```

O conectar el repositorio en [vercel.com](https://vercel.com) y agregar las variables de entorno en el dashboard de Vercel.

---

## 6. Instalar como PWA en el celular

### Android (Chrome)
1. Abrir la app en Chrome
2. Menú → **Agregar a pantalla de inicio**
3. Confirmar

### iOS (Safari)
1. Abrir la app en Safari
2. Botón de compartir → **Agregar a inicio**
3. Confirmar

---

## 7. Estructura del proyecto

```
Nido/
├── app/
│   ├── (protected)/
│   │   ├── layout.tsx          # Layout con BottomNav
│   │   ├── dashboard/page.tsx
│   │   ├── finanzas/page.tsx
│   │   ├── agenda/page.tsx
│   │   ├── habitos/page.tsx
│   │   ├── notas/page.tsx
│   │   └── humor/page.tsx
│   ├── login/page.tsx
│   ├── layout.tsx              # Root layout con providers
│   ├── page.tsx                # Redirect
│   └── globals.css
├── components/
│   ├── BottomNav.tsx
│   ├── Providers.tsx
│   ├── FinanzasModule.tsx
│   ├── AgendaModule.tsx
│   ├── HabitosModule.tsx
│   ├── NotasModule.tsx
│   └── HumorModule.tsx
├── hooks/
│   ├── useFinanzas.ts
│   ├── useAgenda.ts
│   ├── useHabitos.ts
│   ├── useNotas.ts
│   └── useHumor.ts
├── lib/
│   ├── supabase.ts             # Cliente browser
│   ├── supabase-server.ts      # Cliente server-side
│   └── types.ts                # Tipos TypeScript
├── middleware.ts               # Protección de rutas
├── public/
│   ├── manifest.json
│   └── icons/
└── supabase/
    └── schema.sql              # Schema completo con RLS
```

---

## 8. Módulos

| Módulo | Funcionalidad |
|--------|--------------|
| **Finanzas** | Registrar ingresos/gastos, resumen del mes, gráfica por categoría |
| **Agenda** | Tareas del día, pendientes generales, próximos eventos |
| **Hábitos** | Hábitos diarios, racha, vista semanal |
| **Notas** | Notas con etiquetas y filtros por categoría |
| **Humor** | Registro emocional diario con historial |
