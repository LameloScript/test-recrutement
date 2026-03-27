import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  layout("layouts/app-layout.tsx", [
    index("routes/home.tsx"),
    route("dossiers",           "(features)/dossier/list/page.tsx"),
    route("dossiers/nouveau",   "(features)/dossier/nouveau/page.tsx"),
    route("dossiers/liste",     "(features)/dossier/liste/page.tsx"),
    route("dossiers/validation","(features)/dossier/validation/page.tsx"),
    route("dossiers/:id",       "(features)/dossier/(id)/page.tsx"),
  ]),
] satisfies RouteConfig