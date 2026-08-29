export { auth as proxy } from "./auth";

// Only these routes require a logged-in session.
// The register route is intentionally left OUT of this matcher
// so it stays reachable only by typing its exact URL, not by
// being redirected there from anywhere in the app.
export const config = {
  matcher: ["/", "/finance/:path*", "/notes/:path*", "/todos/:path*"],
};
