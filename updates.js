// Check the worker without HTTP-cache reuse; activate updates only on user request.
export async function watchUpdates({
  onReady,
  onUpdate,
  onUnavailable,
  beforeReload = () => true,
}) {
  if (!("serviceWorker" in navigator)) throw new Error("unsupported");
  const workers = navigator.serviceWorker;
  let registration;
  try {
    registration = await workers.register("./sw.js", {
      scope: "./",
      updateViaCache: "none",
    });
  } catch (error) {
    registration = await workers.getRegistration("./");
    if (
      !registration?.active ||
      registration.scope !== new URL("./", location.href).href
    )
      throw error;
  }

  let controller =
      workers.controller?.scriptURL === new URL("./sw.js", location.href).href
        ? workers.controller
        : null,
    waiting = null,
    changed = false,
    applying = null;
  function offer(worker) {
    waiting = worker;
    onUpdate();
  }
  function observe(worker) {
    if (!worker) return;
    const stateChanged = () => {
      if (
        worker.state === "installed" &&
        registration.active &&
        registration.active !== worker
      )
        offer(worker);
      if (worker.state === "activated") onReady();
      if (worker.state === "redundant" && !registration.active) onUnavailable();
    };
    worker.addEventListener("statechange", stateChanged);
    stateChanged();
  }
  workers.addEventListener("controllerchange", () => {
    const current = workers.controller;
    if (!current) {
      controller = null;
      onUnavailable();
      return;
    }
    if (!controller) {
      controller = current;
      if (!applying) return;
    } // First offline installation.
    else if (current === controller) return;
    controller = current;
    changed = true;
    waiting = null;
    function activated() {
      if (current.state !== "activated" || current !== workers.controller)
        return;
      current.removeEventListener("statechange", activated);
      if (applying) applying();
      else onUpdate(); // Another tab activated it; keep this tab's draft intact.
    }
    // controllerchange can precede activation's waitUntil work and cache cleanup.
    current.addEventListener("statechange", activated);
    activated();
  });
  registration.addEventListener("updatefound", () =>
    observe(registration.installing),
  );
  observe(registration.installing);
  observe(registration.active);
  if (registration.active?.state === "activated") onReady();
  if (registration.waiting) offer(registration.waiting);

  let lastCheck = 0,
    checking = false;
  async function check(force = false) {
    if (
      checking ||
      document.hidden ||
      !navigator.onLine ||
      (!force && Date.now() - lastCheck < 60000)
    )
      return;
    checking = true;
    lastCheck = Date.now();
    try {
      await registration.update();
    } catch {
      /* An unreachable release leaves the current offline version usable. */
    } finally {
      checking = false;
    }
  }
  window.addEventListener("online", () => check(true));
  window.addEventListener("focus", () => check());
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) check();
  });
  setInterval(() => check(), 5 * 60 * 1000);
  void check(true);

  function reload() {
    if (beforeReload()) location.reload();
    else onUpdate();
  }

  return {
    async apply() {
      const candidate = registration.waiting || waiting;
      if (!candidate || candidate.state !== "installed") {
        if (!changed) throw new Error("update-unavailable");
        if (controller?.state === "activated") {
          reload();
          return;
        }
      }
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          applying = null;
          reject(new Error("update-timeout"));
        }, 15000);
        applying = () => {
          clearTimeout(timer);
          applying = null;
          resolve();
          reload();
        };
        try {
          if (candidate?.state === "installed")
            candidate.postMessage({ type: "ACTIVATE" });
          else if (controller?.state === "activated") applying();
        } catch (error) {
          clearTimeout(timer);
          applying = null;
          reject(error);
        }
      });
    },
  };
}
