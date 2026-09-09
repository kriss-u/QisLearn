import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("pages/HomePage.tsx"),
  route("course/:courseSlug", "pages/CourseHomePage.tsx"),
  route("lesson/:lessonId", "pages/LessonPage.tsx"),
  route("login", "pages/LoginPage.tsx"),
  route("signup", "pages/SignupPage.tsx"),
  route("profile", "pages/ProfilePage.tsx"),
  route("courses", "pages/CoursesPage.tsx"),
  route("admin", "pages/admin/AdminLayout.tsx", [
    index("pages/admin/AdminHome.tsx"),
    route("courses/:courseSlug", "pages/admin/CourseDetailPage.tsx"),
    route("lessons/:lessonId", "pages/admin/LessonEditorPage.tsx"),
  ]),
] satisfies RouteConfig;
