import Keycloak from "keycloak-js"
import Cookies from "js-cookie"
import type { KeycloakTokenParsed } from "../types/auth"

let keycloak: Keycloak | null = null
let initialized = false

const initKeycloak = async (realm: string) => {
  if (initialized || keycloak?.token) {
    console.log("[KeycloakService] Already initialized or token exists")
    return keycloak
  }

  const isIframe = window.self !== window.top
  const onLoadMode = isIframe ? "check-sso" : "login-required"
  const currentUrl = window.location.origin + window.location.pathname + window.location.search
  const realmName = "FLEXIS-DEV" // Fixed realm name

  keycloak = new Keycloak({
    url: "https://iam-uat.cateina.com",
    realm: realmName,
    clientId: "react-app",
  })

  try {
    console.log("[KeycloakService] Initializing Keycloak with realm:", realmName)

    const authenticated = await keycloak.init({
      onLoad: onLoadMode,
      pkceMethod: "S256",
      checkLoginIframe: false,
      responseMode: "query",
      redirectUri: currentUrl,
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    })

    if (authenticated) {
      console.log("✅ Authenticated")
      initialized = true

      const url = new URL(window.location.href)
      ;["code", "state", "session_state", "iss"].forEach((p) => url.searchParams.delete(p))
      window.history.replaceState({}, "", url.pathname + url.search)

      Cookies.set("accessToken", keycloak.token!, { expires: 1, secure: true })
      Cookies.set("refreshToken", keycloak.refreshToken!, { expires: 1, secure: true })
      Cookies.set("realm", realm, { expires: 1, secure: true })
      Cookies.set("username", (keycloak.tokenParsed as KeycloakTokenParsed).email, { expires: 1, secure: true })
      const groups = (keycloak.tokenParsed as KeycloakTokenParsed) || []
      console.log("groups??", groups.realm_access.roles)
      // const role = groups
      //   .map((g) => {
      //     const noSlash = g.startsWith("/") ? g.substring(1) : g
      //     return noSlash.split("_")[0]
      //   })
      //   .find(Boolean)

      Cookies.set("role", "admin", { expires: 1, secure: true })

      let emailToStore = (keycloak.tokenParsed as KeycloakTokenParsed).email
      if (emailToStore && emailToStore.includes("%")) {
        console.log("Encoded email from Keycloak before storing:", emailToStore)
        try {
          emailToStore = decodeURIComponent(emailToStore)
          console.log("Decoded email from Keycloak before storing:", emailToStore)
        } catch (e) {
          console.error("Error decoding email from Keycloak, storing as-is:", e)
        }
      }
      Cookies.set("email", emailToStore, { expires: 1, secure: true })

      // Auto token refresh
      setInterval(() => {
        keycloak!.updateToken(70).catch(() => {
          console.warn("Token refresh failed, logging out...")
          keycloak!.logout()
        })
      }, 60000)

      return keycloak
    } else {
      console.warn("⛔ Not Authenticated – Triggering login")
      keycloak.login()
      return null
    }
  } catch (err) {
    console.error("❌ Keycloak initialization failed:", err)
    return null
  }
}

const getKeycloak = () => keycloak

const logout = () => {
  console.log("[KeycloakService] Initiating Keycloak logout and clearing cookies...")

  const appCookies = ["accessToken", "refreshToken", "realm", "username", "profileComplete", "email"]

  appCookies.forEach((cookieName) => {
    Cookies.remove(cookieName)
    console.log(`[KeycloakService] Cookie '${cookieName}' removed.`)
  })

  if (keycloak) {
    console.log("[KeycloakService] Keycloak instance found. Calling Keycloak logout.")
    keycloak
      .logout({ redirectUri: window.location.origin + "/" })
      .then(() => {
        console.log("[KeycloakService] Keycloak logout initiated successfully (redirect should follow).")
      })
      .catch((error) => {
        console.error("[KeycloakService] Keycloak logout failed with an error:", error)
        window.location.replace(window.location.origin + "/")
      })
  } else {
    console.warn(
      "[KeycloakService] Keycloak instance is not available. Cannot perform Keycloak logout. Cookies cleared locally.",
    )
    window.location.replace(window.location.origin + "/")
  }
}

export default {
  initKeycloak,
  getKeycloak,
  logout,
}
