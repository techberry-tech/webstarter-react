# WebStarter React Boilerplate

## Prerequisites

- Node.js 22+
- npm

## Installation & How to run

```sh
# Install dependencies
npm i
# Start development servers (React app + Mock server)
npm run dev
# Build to static site
npm run build
```

## Dev URLs

- React Web: http://localhost:5173
- Mockup Server Open API: http://localhost:3001/openapi

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Routing**: TanStack Router with file-based routing
  - https://tanstack.com/router/latest/docs/framework/react/overview
- **State Management**: Zustand for client state
  - https://zustand.docs.pmnd.rs/getting-started/introduction
- **Data Fetching**: TanStack Query (React Query)
  - https://tanstack.com/query/latest/docs/framework/react/overview
- **UI Components**: Mantine UI
  - Components: https://mantine.dev/core/package/
  - Hooks: https://mantine.dev/hooks/package/
  - Dates (Calendar): https://mantine.dev/dates/getting-started/
- **Styling**: Tailwind CSS
- **Form**: React Hook Form
  - https://react-hook-form.com/
- **Icons**: Tabler Icons
  - https://tabler.io/icons
- **Authentication**: JWT with HTTP-only cookies
- **API Client**: Axios

## Project Structure

```
src/
├── api/                  # API layer
│   ├── client.ts         # Axios client configuration
│   └── auth/             # Auth-related API hooks
├── components/           # Reusable components
│   ├── layout/           # Layout components
│   ├── ui/               # UI components
│   └── 404/              # Error pages
├── core/                 # Core functionality
│   ├── auth/             # Authentication logic
│   ├── router/           # Router configuration
│   └── theme/            # Theme configuration
├── routes/               # File-based routing
├── config/               # Configuration files
└── lib/                  # Utility functions
```

## Overview and Practice

ตัวโปรเจคจะมีการตั้งโครง Menu Layout และระบบ Authentication ไว้ให้แล้ว โดยต้องมีการ Login ก่อนทุกครั้งเพื่อเข้าสู่ระบบ

### หลักการตั้งชื่อไฟล์และโฟลเดอร์

โดยทั่วไปในโปรเจคนี้เราจะใช้วิธี ตั้งชื่อเป็นภาษาอังกฤษ ตัวพิมพ์เล็กทั้งหมด คั่นด้วยเครื่องหมาย dash (-) เช่น

- `search-flight.tsx`
- `use-search-flight.ts`

เว้นแต่ว่ามีความจำเป็นต้องใช้ pattern อื่น ก็สามารถตั้งได้ตามแบบที่ต้องการ

### การเพิ่มหน้า (Add a new page)

โปรเจคนี้ใช้ Router library ชื่อว่า TanStack Router เป็นระบบ File-based routing และเนื่องจากมีการทำโครง Layout ไว้แล้ว หากต้องการเพิ่มหน้า ต้องเข้าไปสร้างที่

`src/routes/_pathlessLayout/{applicationName}/{pageName}.tsx`

โดย `{applicationName}` จะตั้งตามชื่อแอพพลิเคชั่นซึ่งจะเป็นโฟลเดอร์

และ `{pageName}.tsx` จะตั้งตาม module/feature ของแอพซึ่งจะเป็นไฟล์ `.tsx`

ยกตัวอย่างเช่น `flight-booking/search-flight.tsx`

<span style="color:#e64c4c;">

<b>⚠️⚠️⚠️ Important !! สำคัญมาก ⚠️⚠️⚠️</b>

- ก่อนสร้างหน้าใหม่ ตัว dev server ควรจะกำลังรันอยู่เสมอ (รันจาก `npm run dev`) เพื่อให้ตัว library สามารถ auto initial page data ได้
- นอกจากนั้นตัว library จะทำการ auto generate & edit ไฟล์ `src/routeTree.gen.ts` ด้วย ซึ่งห้ามแก้ไฟล์นี้เด็ดขาด ให้ library เป็นคนจัดการเท่านั้น

</span>

ตัวอย่างโค้ดบางส่วน ถ้า dev server รันอยู่และกดสร้างหน้าใหม่

```jsx
// ถูกสร้างอัตโนมัติจาก library (Required for library)
export const Route = createFileRoute("/_pathlessLayout/flight-booking/search-flight")({
  component: RouteComponent,
});

// ถูกสร้างอัตโนมัติจาก library
function RouteComponent() {
  return <div>Route Component</div>;
}
```

ซึ่งหากไม่ start dev server ก่อน ตัว library จะไม่ทำงานและไม่ generate code ตามด้านบนให้ (เป็นไฟล์เปล่า) ต้อง copy จากไฟล์อื่นมา หรือลบและสร้างใหม่หลังจาก start dev server

### การเพิ่มและแก้ไขเมนู

การปรับแก้เมนูจะอยู่ที่ไฟล์ `src/config/menu.ts` ในส่วนของตัวแปร MyMenu

```jsx
export const MENUS: MyMenu[] = [
  {
    title: "Flight Booking", // ชื่อแอพพลิเคชั่น
    items: [ // เมนูของแอพนี้
      {
        icon: IconPlane, // เมนูไอคอน
        label: "Search Flights", // ชื่อเมนู
        href: "/flight-booking/search-flight", // route name or uri
      },
    ],
  },
  {
    title: "Accounting",
    items: [
      {
        icon: IconUsersGroup,
        label: "Users",
        href: "/accounting/users",
      },
    ],
  },
] as const;
```

### การเพิ่ม Components

โดยปกติการสร้างหน้าใหม่ๆ มักจะต้องมี components ของหน้านั้นๆ เสมอ ซึ่งเราจะเก็บไฟล์ไว้ที่

`src/components/{applicationName}/{componentName}.tsx`

โดยหากเป็น global component (ตัวกลาง re-use ใช้ร่วมกันหลายหน้า) สามารถสร้างไว้ที่

`src/components/{componentName}.tsx` หรือ `src/components/global/{componentName}.tsx`

### การเพิ่ม API Request

เนื่องจากเรามีการใช้ library ที่ใช้เชื่อมต่อกับ API อยู่ 2 ตัวคือ `axios` และ `tanstack-query` โดยทาง TechBerry ได้มีการตั้งโครง `axios` ไว้ให้แล้วเป็น function ชื่อว่า `makeRequest` อยู่ที่ไฟล์ `src/api/client.ts` ซึ่งคาดว่าอาจจะไม่ต้องแก้อะไรหากไม่จำเป็น

และตัวที่จะใช้หลักๆคือ `tanstack-query` แบบ `useQuery` และ `useMutation` ตัวอย่างสามารถดูได้จาก

- `src/api/flight-booking/use-get-city-list.ts`
- `src/api/flight-booking/use-search-flight.ts`

รายละเอียดวิธีใช้แบบ advance สามารถดูได้จากเอกสารหลัก (แนบไว้ด้านบนในส่วนของ Tech Stack) หรือสอบถามทาง TechBerry
