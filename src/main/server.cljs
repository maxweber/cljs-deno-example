(ns server
  (:require ["https://deno.land/std@0.160.0/http/server.ts" :as http]
            ))

(defn headers->map
  [headers]
  (reduce
   (fn [aggr [k v]] (assoc aggr (keyword k) v))
   {}
   (.entries headers)))

(defn req->ring
  [^http/ServerRequest request ^http/ConnInfo connInfo]
  (let [conn connInfo]
    {:body (.-body request)
     :headers (headers->map (.-headers request))
     :request-method (keyword (.toLowerCase (.-method request)))
     :uri (.-url request) ;; just a string
     :protocol (.-proto request)
     :remote-addr (->> conn (.-remoteAddr) (.-hostname))
     :scheme :http ;; no idea how to retrieve it
     ;; can't retrieve the actual hostname from the request,
     ;; it just gives 127.0.0.1
     :server-name (->> conn (.-localAddr) (.-hostname))
     :server-port (->> conn (.-localAddr) (.-port))}))

(defn ^http/Response ring->response
  [ring-map]
  (clj->js ring-map))

(defn http-server
  ([handler] (http-server handler {}))
  ([handler {:keys [host port]
             :or {host "0.0.0.0" port 8000}}]
   (println (str "Starting Deno HTTP server at " host ":" port))
   (http/serve (fn [request connInfo]
                 (let [ring-request (req->ring request connInfo)
                       ring-response (handler ring-request)]
                   ;; TODO: convert all parts of ring-response
                   (js/Response. (:body ring-response)
                                 #js {:status (:status ring-response)})))
               )))
