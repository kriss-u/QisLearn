import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("pages/HomePage.tsx"),
  route("lesson/:lessonId", "pages/LessonPage.tsx"),
] satisfies RouteConfig;
