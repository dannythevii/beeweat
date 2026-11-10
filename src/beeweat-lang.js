// Beeweat 14.75 — doppia lingua (italiano / inglese).
// L'app è scritta in italiano; questo modulo traduce al volo i testi dell'interfaccia (mai i contenuti delle api)
// guardando la pagina mentre si disegna. Scelta automatica dalla lingua del telefono, oppure dal Profilo → Lingua.
// Per aggiungere o correggere una traduzione basta toccare DICT (testo italiano → inglese) o RULES (testi con numeri).

const KEY = "bw_lang";

export const LANG_NAMES = { it: "Italiano", en: "English" };

// "" = automatica (lingua del telefono)
export function getLangChoice() { try { return localStorage.getItem(KEY) || ""; } catch (_) { return ""; } }
export function setLangChoice(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (_) {} }
export function getLang() {
  const c = getLangChoice();
  if (c === "it" || c === "en") return c;
  const nav = (navigator.language || (navigator.languages || [])[0] || "it").toLowerCase();
  return nav.startsWith("it") ? "it" : "en";
}

// ─── DIZIONARIO: italiano → inglese (testi fissi, così come compaiono sullo schermo) ────────────────────
const DICT = {
  // navigazione e titoli
  "Feed": "Feed", "Radar": "Radar", "Eventi": "Events", "Profilo": "Profile", "Chat": "Chat", "Messaggi": "Messages",
  "Cieli": "Skies", "Cielo": "Sky", "cieli": "skies", "cielo": "sky", "Stelle": "Stars", "stelle": "stars", "stella": "star",
  "Follower": "Followers", "Seguiti": "Following", "Seguito": "Following", "Segui": "Follow", "Smetti di seguire": "Unfollow",
  "Nuovo": "New", "Nuovo cielo": "New sky", "Nuovo evento": "New event", "Nuovo gruppo": "New group", "Nuovi post": "New posts",
  "Nuovo messaggio": "New message", "Nuovo follower": "New follower", "Indietro": "Back", "Torna indietro": "Go back", "Chiudi": "Close",
  "Annulla": "Cancel", "Salva": "Save", "Salva modifiche": "Save changes", "Invia": "Send", "Cerca": "Search", "Scegli": "Choose",
  "Cambia": "Change", "Correggi": "Fix", "Elimina": "Delete", "Esci": "Log out", "Logout": "Log out", "Entra": "Sign in", "Accedi": "Sign in",
  "Registrati": "Sign up", "Inizia": "Start", "Attiva": "Turn on", "Consenti": "Allow", "Richiedi": "Request", "Chiedi": "Ask",
  "Più tardi": "Later", "No, grazie": "No, thanks", "Accetto": "I accept", "Gestisci": "Manage", "Sospendi": "Suspend", "Rifai": "Retake",
  // 14.83: dati veri o niente
  "Previsione oraria non disponibile in questo momento": "Hourly forecast not available right now", "Dato non disponibile": "Data not available",
  "Il modello del mare non risponde: riprova tra poco": "The sea model is not responding: try again shortly",
  "Avviso di maltempo attivo": "Bad-weather alert on", "La password deve avere almeno 8 caratteri.": "The password must be at least 8 characters long.",
  "Le notifiche di prossimità usano la tua posizione e richiedono il permesso del dispositivo. Le notifiche arrivano con l'app installata (Aggiungi alla schermata Home) o scaricata dallo store.": "Proximity notifications use your location and need the device's permission. Notifications arrive with the app installed (Add to Home Screen) or downloaded from the store.",
  // 14.81: blocca utente, privacy e termini
  "Blocca": "Block", "Sblocca": "Unblock", "Hai bloccato questa ape.": "You blocked this bee.",
  "Non vedi i suoi cieli e i suoi messaggi, e lei non può scriverti.": "You don't see their skies or messages, and they can't write to you.",
  "non vedrai più i suoi cieli e messaggi, e non potrà scriverti.": "you won't see their skies and messages any more, and they won't be able to write to you.",
  "è stata bloccata: la sblocchi dal suo profilo quando vuoi.": "has been blocked: you can unblock them from their profile any time.",
  "Informativa sulla Privacy": "Privacy Policy", "Quali dati usa Beeweat e perché": "Which data Beeweat uses and why",
  "Termini di Servizio": "Terms of Service", "Le regole dell'alveare": "The rules of the hive",
  "Come Beeweat tratta i tuoi dati personali.": "How Beeweat handles your personal data.", "Le regole che valgono per tutte le api dell'alveare.": "The rules that apply to every bee in the hive.",
  "Blocco non riuscito": "Block failed", "Sblocco non riuscito": "Unblock failed",
  // 14.80: cielo in movimento
  "Video 5″": "Video 5″", "Foto": "Photo", "Foto o video": "Photo or video", "Video · 5″": "Video · 5″", "Cielo in video": "Sky on video",
  "Video di 5 secondi": "5-second video", "Video di 5 secondi · senza audio": "5-second video · no sound",
  "Tieni il telefono fermo: si ferma da solo a 5 secondi": "Hold the phone still: it stops by itself at 5 seconds",
  "Registra un video di 5 secondi": "Record a 5-second video", "Ferma la registrazione": "Stop recording", "Registra": "Record", "Ferma": "Stop",
  "Gira la fotocamera": "Flip the camera",
  "La registrazione è venuta vuota: tocca di nuovo il tasto e tieni il telefono fermo per 5 secondi.": "The recording came out empty: tap the button again and hold the phone still for 5 seconds.",
  "Questo telefono non registra video dal browser: scatta una foto.": "This phone can't record video from the browser: take a photo instead.",
  "Registrazione non avviabile: riprova.": "Recording could not start: try again.",
  "Rifai la foto": "Retake the photo", "Scatta": "Shoot", "Scatta il cielo": "Shoot the sky", "Scatta il tuo cielo": "Shoot your sky",
  "Scatta un cielo": "Shoot a sky", "Scatta un nuovo cielo": "Shoot a new sky", "Pubblica ora": "Publish now", "Pubblicazione…": "Publishing…",
  "Pubblica evento social": "Publish social event", "Pubblica evento meteo": "Publish weather event", "Segnala": "Report",
  "Segnala un evento": "Report an event", "Segnala contenuto": "Report content", "Segnala il contenuto": "Report this content",
  "Segnala questo cielo": "Report this sky", "Invia segnalazione": "Send report", "Condividi": "Share", "Condividi l'evento": "Share the event",
  "Zoom": "Zoom", "Vista intera": "Full view", "Torna alla vista intera": "Back to full view", "Mondo": "World", "Mondo ✓": "World ✓",
  "Tutto il mondo": "Whole world", "Mostra tutto il mondo": "Show the whole world", "Vicini": "Nearby", "Cieli vicini": "Nearby skies",
  "Torna ai cieli vicini": "Back to nearby skies", "Tutti i cieli": "All skies", "tutti i cieli": "all skies", "altri cieli": "more skies",
  "Le api": "Bees", "api": "bees", "Tutte le api": "All bees", "Tutti gli utenti": "All users", "Persone": "People", "Gruppi": "Groups",
  "Social": "Social", "social": "social", "Meteo": "Weather", "meteo": "weather", "Media": "Medium", "MEDIA": "MEDIUM", "media": "medium", "nome@esempio.it": "name@example.com", "foto · 3 h": "photos · 3 h", "in tutto il mondo": "in the whole world",
  "max": "max", "· min": "· min", "online": "online", "in volo": "in flight", "adesso": "now", "· adesso": "· now", "allo scatto": "at the shot",
  "fa": "ago", "da": "by", "dove": "where", "entro": "within", "km": "km", "km/h": "km/h", "°": "°", "concordi": "agree",
  "sopravento": "upwind", "foto maltempo": "bad-weather photos", "km/h vento": "km/h wind", "Alba": "Sunrise", "Tramonto": "Sunset",
  "Luna": "Moon", "Sole e luna": "Sun and moon", "Vento": "Wind", "Onda": "Waves", "Mare": "Sea", "Stato del mare": "Sea state",
  "stato del mare": "sea state", "Temperatura": "Temperature", "Temperatura in gradi": "Temperature in degrees", "Condizione": "Condition",
  "Posizione": "Location", "Posizione precisa": "Precise location", "Località": "Place", "Città": "City", "Indirizzo": "Address",
  "Titolo": "Title", "Descrizione": "Description", "Categoria": "Category", "Tipo": "Type", "Severità": "Severity", "Data e ora": "Date and time",
  "Email": "Email", "Password": "Password", "Messaggio": "Message", "Evento": "Event", "evento": "event", "eventi": "events", "allerta": "alert",
  "allerte": "alerts", "modello": "model", "modello ok": "model ok", "modello corretto": "model corrected", "controllo": "check",
  "secondo parere": "second opinion", "riprova": "retry", "mappa": "map", "utenti collegati": "users online", "api online adesso": "bees online now",
  "segnalato da": "reported by", "ti ha scritto": "wrote to you", "ha segnalato un evento 📌": "reported an event 📌", "Un utente": "A user",
  "Utente": "User", "Utente Bee": "Bee User", "Un'ape che segui": "A bee you follow", "nell'alveare": "in the hive", "foto della community": "community photos",
  "modelli meteo e marini": "weather and marine models", "della costa": "of the coast", "puoi pubblicare subito": "you can publish right away",
  "server non collegato": "server not connected", "solo la città (≈)": "city only (≈)", "sono state pubblicate": "were published",
  "è stata pubblicata": "was published", "invio…": "sending…", "in revisione": "under review", "in attesa · tocca per riprovare": "pending · tap to retry",
  "tocca 👆": "tap 👆", "link sicuro": "secure link", "Inviato": "Sent", "Consegnato": "Delivered", "Letto": "Read", "Approvata": "Approved",
  "In revisione": "Under review", "Segnalato, in revisione": "Reported, under review", "Segnalazione inviata": "Report sent",
  "Segnalazione meteo": "Weather report", "Alta": "High", "Bassa": "Low", "bassa": "low", "Non indicato": "Not set", "Donna": "Woman", "Uomo": "Man",
  "Altro": "Other", "Chi sei": "Who you are", "Lingua": "Language", "Automatica": "Automatic", "Italiano": "Italian", "English": "English",
  "lingua del telefono": "phone language",

  // condizioni e mare
  "Sereno": "Clear", "Poco nuvoloso": "Partly cloudy", "Molto nuvoloso": "Mostly cloudy", "Nuvoloso": "Cloudy", "Coperto": "Overcast",
  "Pioggia": "Rain", "Pioviggine": "Drizzle", "Rovesci": "Showers", "Temporale": "Thunderstorm", "Neve": "Snow", "Nebbia": "Fog",
  "Ventoso": "Windy", "Arcobaleno": "Rainbow", "Calmo": "Calm", "Poco mosso": "Slight", "Poco\nmosso": "Slight", "Mosso": "Moderate",
  "Molto mosso": "Rough", "Molto\nmosso": "Rough", "Agitato": "Very rough", "Pioggia adesso": "Rain now", "Niente pioggia in vista": "No rain in sight",
  "Pioggia tra ~1 h": "Rain in ~1 h", "Luna nuova": "New moon", "Crescente": "Waxing crescent", "Primo quarto": "First quarter",
  "Gibbosa cresc.": "Waxing gibbous", "Luna piena": "Full moon", "Gibbosa cal.": "Waning gibbous", "Ultimo quarto": "Last quarter", "Calante": "Waning crescent",
  "N": "N", "NE": "NE", "E": "E", "SE": "SE", "S": "S", "SO": "SW", "O": "W", "NO": "NW",
  "Anidride carbonica nell'aria": "Carbon dioxide in the air", "Leggo il dato di Mauna Loa…": "Reading the Mauna Loa value…", "ppm": "ppm",

  // feed
  "Apri il feed": "Open the feed", "Apri il Radar": "Open the Radar", "Apri gli avvisi": "Open alerts", "Apri il tuo profilo": "Open your profile",
  "Apri le impostazioni": "Open settings", "Apri i commenti": "Open comments", "Apri la foto": "Open the photo", "Apri la foto a schermo intero": "Open the photo full screen",
  "Foto a schermo intero": "Full-screen photo", "Apri il post premiato": "Open the awarded post", "Apri questo cielo nel Feed": "Open this sky in the Feed",
  "Vai al cielo nel Feed": "Go to the sky in the Feed", "Metti una stella": "Give a star", "Togli la stella": "Remove the star", "Scrivi": "Write",
  "Modifica post": "Edit post", "Modifica cielo": "Edit sky", "Modifica questo cielo": "Edit this sky", "Descrivi il meteo…": "Describe the weather…",
  "Cielo verificato": "Verified sky", "Verificato dagli occhi dell'alveare": "Verified by the eyes of the hive", "Foto premiata": "Awarded photo",
  "Foto non meteo": "Not a weather photo", "Contenuto inappropriato": "Inappropriate content", "Spam o pubblicità": "Spam or advertising",
  "Persone in primo piano": "People in the foreground", "Perché vuoi segnalare il post di": "Why do you want to report the post by",
  "Grazie. Il contenuto è ora": "Thank you. The content is now", "e verrà controllato dal nostro sistema di moderazione.": "and will be checked by our moderation system.",
  "Post da": "Post by", "I miei cieli ·": "My skies ·", "I suoi cieli ·": "Their skies ·", "Nessun cielo da mostrare.": "No sky to show.",
  "Nessun cielo ancora.": "No sky yet.", "Nessun cielo ancora — scatta il tuo meteo!": "No sky yet — shoot your weather!",
  "Nessun cielo dalle api che segui": "No sky from the bees you follow", "Nessun cielo nel mondo, per ora": "No sky in the world, for now",
  "Nessuna ape nel mondo, per ora": "No bee in the world, for now", "Appena un'ape pubblica, compare qui.": "As soon as a bee publishes, it shows up here.",
  "Allarga il raggio per vedere i cieli delle api più lontane, oppure pubblica tu il primo.": "Widen the radius to see the skies of bees farther away, or publish the first one yourself.",
  "Allarga il raggio o guarda tutto il mondo: le api non mancano.": "Widen the radius or look at the whole world: there is no shortage of bees.",
  "Togli il filtro o segui qualche ape in più.": "Remove the filter or follow a few more bees.", "Solo api che seguo": "Only bees I follow",
  "Raggio": "Radius", "Raggio e filtri": "Radius and filters", "Raggio in chilometri": "Radius in kilometres", "Raggio di prossimità": "Proximity radius",
  "Raggio degli avvisi": "Alert radius", "In diretta": "Live", "Foto meteo pubblicate vicino a te": "Weather photos published near you",
  "Chat pubblica": "Public chat", "Chat pubblica del posto": "Local public chat", "Chat pubblica · visibile a tutti": "Public chat · visible to everyone",
  "chat del posto": "local chat", "TU": "YOU", "Scrivi a tutti…": "Write to everyone…", "Scrivi il primo messaggio qui sotto.": "Write the first message below.",
  "Confermo, anche da me cielo così!": "I confirm, same sky here too!", "Il tuo cielo": "Your sky", "Che cielo è": "What sky is it",
  "Lo dice la community": "Says the community", "Sei senza rete": "You are offline", "Senza rete: va nello zaino": "Offline: it goes in the backpack",
  "Parte da sola al ritorno della linea.": "It will leave on its own when the connection is back.", "— tocca qui per aggiornare": "— tap here to refresh",
  "Elimina il messaggio": "Delete the message", "Svuota la conversazione": "Clear the conversation", "Segna tutti letti": "Mark all as read",
  "Eliminare definitivamente questo post?": "Permanently delete this post?", "Eliminazione non riuscita": "Deletion failed", "Elimino…": "Deleting…",
  "Modifica non riuscita": "Edit failed", "Modifica non salvata": "Edit not saved", "Premio non riuscito": "Award failed",
  "🏅 Premia questa foto (annuncio a tutte le api)": "🏅 Award this photo (announced to all bees)", "La foto migliore è stata scattata da": "The best photo was taken by",
  "Tocca la foto per vedere il post 🐝": "Tap the photo to see the post 🐝", "Cielo precedente in questo punto": "Previous sky at this spot",
  "Cielo successivo in questo punto": "Next sky at this spot", "Salva la foto nel telefono": "Save the photo to your phone", "Salva nel telefono": "Save to phone",
  "Salva immagine": "Save image", "Foto salvata nel telefono": "Photo saved to your phone", "Nessun messaggio, per ora": "No messages, for now",
  "Quando qualcuno ti scrive, lo troverai qui.": "When someone writes to you, you'll find it here.", "Nessun avviso per ora.": "No alerts for now.",
  "Avvisi": "Alerts", "Avvisi disattivati": "Alerts off", "Avvisami": "Alert me", "Avvisami entro": "Alert me within",
  "Messaggio dall'alveare 📣": "Message from the hive 📣", "Messaggio all'alveare": "Message to the hive",
  "Invia un avviso a tutte le api (solo admin)": "Send a notice to all bees (admin only)", "Il cielo ti chiama": "The sky is calling you",
  "Temporali, mareggiate e avvisi importanti": "Thunderstorms, sea storms and important notices", "Forte temporale in arrivo": "Strong thunderstorm coming",
  "Mareggiata sulla costa": "Sea storm on the coast", "Raffiche di vento intense": "Strong wind gusts", "Maltempo nei dintorni": "Bad weather nearby",
  "Maltempo in avvicinamento": "Bad weather approaching", "Nessun maltempo osservato in avvicinamento": "No bad weather seen approaching",

  // radar / beecast
  "Ingrandisci il radar": "Enlarge the radar", "Tocca un cielo per i dettagli · i cieli dello stesso punto stanno in cerchio · pizzica per zoomare": "Tap a sky for details · skies from the same spot sit in a circle · pinch to zoom",
  "Allerte meteo": "Weather alerts", "Allerte attive": "Active alerts", "Allerte di prossimità": "Proximity alerts", "Allerta BeeCast": "BeeCast alert",
  "Allerte ufficiali · rischio temporali": "Official alerts · thunderstorm risk", "Nessuna allerta ufficiale": "No official alert",
  "Allerte ufficiali non disponibili in questo momento. Riprova tra poco.": "Official alerts not available right now. Try again shortly.",
  "· MeteoAlarm · MeteoAM · modelli internazionali": "· MeteoAlarm · MeteoAM · international models", "Fonte:": "Source:", "Modello:": "Model:",
  "· confermato dalle foto": "· confirmed by the photos", "confermato dalle foto": "confirmed by the photos", "le foto raccontano altro": "the photos tell a different story", "· le foto raccontano altro": "· the photos tell a different story", "· ultime 6 ore": "· last 6 hours",
  "· affidabilità media": "· medium confidence", "Prossime 6 h": "Next 6 h", "Prossime 12 ore": "Next 12 hours", "Prossimi 7 giorni": "Next 7 days",
  "Previsione collaborativa ·": "Collaborative forecast ·", "BeeCast analizza le": "BeeCast analyses the", "nelle foto della costa — e la loro direzione di spostamento, e le incrocia con i": "in the photos of the coast — and the direction they move in, and cross-checks them with the",
  "nelle ultime ore), riconosce le condizioni reali — incluso lo": "in the last hours), recognises the real conditions — including the", "per correggere la previsione delle prossime 12 ore.": "to correct the forecast for the next 12 hours.",
  "Stima collaborativa indicativa, non è un'allerta ufficiale. Più foto ci sono, più è accurata.": "Indicative collaborative estimate, not an official alert. The more photos, the more accurate it is.",
  "In ascolto del cielo…": "Listening to the sky…", "In attesa di foto": "Waiting for photos", "si attivano con le foto della community": "they switch on with the community's photos",
  "Vuoi essere avvisato quando BeeCast rileva maltempo vicino a te?": "Do you want to be alerted when BeeCast detects bad weather near you?",
  "Gli occhi dell'alveare": "The eyes of the hive", "Apri gli occhi dell'alveare": "Open the eyes of the hive", "Dove brilla l'alveare": "Where the hive shines",
  "Mille occhi, un solo cielo.": "A thousand eyes, one sky.", "Lettura del cielo in corso": "Reading the sky", "Esplora la zona sulla mappa": "Explore the area on the map",
  "Copernicus": "Copernicus", "Solano": "Solano", "MeteoAlarm": "MeteoAlarm", "Affidabilità ": "Confidence ",

  // eventi
  "Eventi e allerte": "Events and alerts", "Eventi e segnalazioni nella tua zona": "Events and reports in your area", "Eventi meteo": "Weather events",
  "Eventi social": "Social events", "Eventi pubblicati": "Published events", "Crea un nuovo evento": "Create a new event",
  "Creane uno con il + in alto a destra.": "Create one with the + at the top right.", "Allarga lo sguardo, oppure crea tu il primo con il tasto Nuovo in alto.": "Widen your view, or create the first one with the New button at the top.",
  "Nessuna segnalazione attiva vicino a te: buon segno. Con il tasto Nuovo in alto puoi segnalarne una.": "No active report near you: good sign. With the New button at the top you can report one.",
  "Es. Aperitivo al tramonto": "E.g. Sunset aperitif", "Es. Temporale violento sul porto": "E.g. Violent storm over the harbour", "Es. Capri": "E.g. Capri",
  "Es. nuvole basse sul mare, vento da nord": "E.g. low clouds over the sea, north wind", "Descrizione dell'evento": "Event description",
  "Racconta l'evento: programma, ospiti, cosa aspettarsi…\nVai a capo per i paragrafi.": "Describe the event: programme, guests, what to expect…\nNew line for paragraphs.",
  "Logo o immagine": "Logo or picture", "Aggiungi una foto": "Add a photo", "Carica un'immagine": "Upload a picture", "Immagine pronta ✓": "Picture ready ✓",
  "Facoltativa · dal telefono": "Optional · from the phone", "Facoltativa · scattata sul momento": "Optional · taken on the spot", "(facoltativa)": "(optional)",
  "Link di info (facoltativo)": "Info link (optional)", "Contatto dell'organizzatore": "Organiser's contact", "Telefono, WhatsApp o email": "Phone, WhatsApp or email",
  "Comparirà sull'evento": "It will show on the event", "Organizzato da": "Organised by", "Valido fino a": "Valid until", "Posizione evento": "Event location",
  "Nome della strada": "Street name", "Via": "Street", "Viale": "Avenue", "Corso": "Boulevard", "Piazza": "Square", "Piazzale": "Plaza", "Largo": "Place",
  "Vicolo": "Alley", "Lungomare": "Seafront", "Strada": "Road", "Salita": "Rise", "Traversa": "Side street", "Contrada": "District", "N°": "No.",
  "Compila i campi e tocca Trova; senza indirizzo verrà usata la tua posizione attuale": "Fill in the fields and tap Find; without an address your current location will be used",
  "📍 Trova": "📍 Find", "Cerco il posto sulla mappa…": "Looking for the place on the map…", "Cerco la posizione…": "Getting the location…",
  "Posizione del telefono in arrivo…": "Phone location coming…", "Con la posizione del telefono finisce sul punto giusto della mappa.": "With the phone's location it lands on the right spot on the map.",
  "Trovata la via ✓ (senza numero civico)": "Street found ✓ (without house number)", "Trovata la città ✓ — la spilla cadrà sul centro (via non riconosciuta)": "City found ✓ — the pin will drop on the centre (street not recognised)",
  "Posto non trovato e GPS spento: controlla la città scritta per esteso": "Place not found and GPS off: check the city written in full",
  "Posto non trovato sulla mappa: la spilla resta dov'era (l'indirizzo scritto viene salvato)": "Place not found on the map: the pin stays where it was (the written address is saved)",
  "Posto non trovato sulla mappa: userò la tua posizione attuale 📍 (l'indirizzo scritto resta nella scheda)": "Place not found on the map: I'll use your current location 📍 (the written address stays on the card)",
  "Prova con il nome o la città scritti per esteso.": "Try with the name or the city written in full.", "Serve un titolo.": "A title is needed.",
  "Il titolo è obbligatorio.": "The title is required.", "Serve la data e l'ora dell'evento.": "The event's date and time are needed.",
  "Serve la posizione": "Location needed", "Evento non salvato: ": "Event not saved: ", "Modifica evento": "Edit event", "Modifica evento meteo ⛈️": "Edit weather event ⛈️",
  "Modifica evento social 🎉": "Edit social event 🎉", "Modifica o elimina l'evento": "Edit or delete the event", "Elimina evento": "Delete event",
  "Elimina avviso": "Delete notice", "Cancella elemento": "Delete item", "📞 Contatto": "📞 Contact", "🔗 Info": "🔗 Info", "🗺️ Vedi sulla mappa": "🗺️ See on the map",
  "Apri in Google Maps": "Open in Google Maps", "Copia il testo dell'evento:": "Copy the event text:", "Testo dell'evento copiato: incollalo dove vuoi 📋": "Event text copied: paste it wherever you like 📋",
  "🍸 Aperitivo": "🍸 Aperitif", "🍽️ Cena / Food": "🍽️ Dinner / Food", "🎀 Inaugurazione": "🎀 Opening", "🎉 Party": "🎉 Party", "🎪 Festa / Sagra": "🎪 Fair / Festival",
  "🎭 Spettacolo": "🎭 Show", "🎶 Concerto": "🎶 Concert", "🏟️ Evento sportivo": "🏟️ Sports event",
  "Mareggiata": "Sea storm", "allerta meteo": "weather alert",

  // beeworld / beepaper
  "BeeWorld": "BeeWorld", "BeePaper": "BeePaper", "BeeCast": "BeeCast", "Cerca api, luoghi e città": "Search bees, places and cities",
  "Cerca api, luoghi, città": "Search bees, places, cities", "Cerca persone, luoghi, eventi…": "Search people, places, events…", "Cerca tra le api…": "Search among bees…",
  "Cerca in tutto il mondo…": "Search the whole world…", "Cancella la ricerca": "Clear the search", "Persone in primo piano": "Featured people",
  "Luoghi vicino a te": "Places near you", "Altri luoghi": "Other places", "La tua zona": "Your area", "Segui questo luogo": "Follow this place",
  "Api che segui (": "Bees you follow (", "Luoghi che segui (": "Places you follow (", "Eventi (": "Events (", "I tuoi gruppi (": "Your groups (",
  "Api a": "Bees at", "Non segui ancora nessuna ape — trovale nella lista sotto.": "You don't follow any bee yet — find them in the list below.",
  "Non segui ancora nessuno.": "You don't follow anyone yet.", "Nessun luogo seguito — tocca la stella sui luoghi in BeePaper.": "No place followed — tap the star on places in BeePaper.",
  "Nessun follower per ora — pubblica bei cieli!": "No followers yet — publish beautiful skies!", "Le stelle ricevute": "Stars received",
  "I tuoi cieli, mese per mese": "Your skies, month by month", "Apri tutti i tuoi cieli, mese per mese": "Open all your skies, month by month",
  "Ogni cielo che pubblichi resta qui, mese per mese.": "Every sky you publish stays here, month by month.", "Apro l'archivio dell'alveare…": "Opening the hive archive…",
  "Nessun'ape ha ancora scattato qui: tocca a te.": "No bee has shot here yet: your turn.", "tutti i tuoi cieli con le foto, le stelle e i commenti ricevuti": "all your skies with the photos, stars and comments received",

  // gruppi e chat
  "Chat e messaggi di gruppo": "Chat and group messages", "Crea un gruppo": "Create a group", "Crea gruppo": "Create group", "Nome del gruppo": "Group name",
  "Nessun gruppo ancora.": "No group yet.", "Membri del gruppo": "Group members", "Gestisci i membri del gruppo": "Manage group members", "Modifica gruppo": "Edit group",
  "Aggiungi contatto": "Add contact", "Aggiungi un contatto": "Add a contact", "Nessun contatto disponibile.": "No contact available.",
  "Tocca per aggiungere o rimuovere dai contatti": "Tap to add to or remove from contacts", "Hai già aggiunto tutti gli utenti disponibili 🎉": "You've already added all available users 🎉",
  "Servono altri utenti registrati per formare un gruppo.": "More registered users are needed to form a group.", "Creazione gruppo non riuscita": "Group creation failed",
  "Aggiornamento membri non riuscito": "Members update failed", "Invia il messaggio": "Send the message", "Invio non riuscito": "Sending failed",
  "Chat con gli amministratori": "Chat with the administrators", "Centro assistenza": "Help centre", "Come possiamo aiutarti": "How can we help you",
  "Scrivi a chi tiene in piedi l'alveare": "Write to those who keep the hive going", "Un problema, un'idea, una foto respinta ingiustamente? Scrivi a chi tiene in piedi l'alveare: ti risponde in chat 🐝": "A problem, an idea, a photo wrongly rejected? Write to those who keep the hive going: they'll answer you in chat 🐝",
  "Cerco gli amministratori…": "Looking for the administrators…", "Nessun amministratore disponibile al momento.": "No administrator available right now.",
  "Le risposte alle domande più frequenti": "Answers to the most frequent questions", "Le domande più frequenti dell'alveare. Non trovi la tua? Scrivi agli amministratori dal Centro assistenza 🐝": "The hive's most frequent questions. Can't find yours? Write to the administrators from the Help centre 🐝",
  "Conferma di lettura": "Read receipts", "Attiva · chi ti scrive vede quando hai letto": "On · people who write to you see when you've read",
  "Disattivata · nessuna spunta di lettura": "Off · no read ticks",

  // profilo
  "Profilo aggiornato ✓": "Profile updated ✓", "Cambia avatar": "Change avatar", "Cambia la foto del profilo": "Change the profile photo", "Icona profilo": "Profile icon",
  "Oppure scegli un'emoji": "Or choose an emoji", "Dove mettiamo la tua foto?": "Where shall we put your photo?", "Modifica nome": "Edit name", "Modifica il nome": "Edit the name",
  "Modifica città": "Edit city", "Modifica la città": "Edit the city", "Il tuo nome": "Your name", "La tua città": "Your city", "La tua email": "Your email",
  "Il tuo nome su Beeweat:": "Your name on Beeweat:", "La tua città su Beeweat:": "Your city on Beeweat:", "Nome dell'ape:": "Bee's name:", "Città dell'ape:": "Bee's city:",
  "Il nome è troppo corto.": "The name is too short.", "La città non può essere vuota.": "The city can't be empty.", "Nome non salvato: ": "Name not saved: ",
  "Città non salvata": "City not saved", "Impostazione non salvata": "Setting not saved", "Segui non salvato: ": "Follow not saved: ",
  "Configurazione": "Settings", "Impostazioni": "Settings", "Notifiche": "Notifications", "Permessi del telefono": "Phone permissions",
  "Come funziona": "How it works", "Come funziona Beeweat": "How Beeweat works", "Come funziona Beeweat, in sei passi": "How Beeweat works, in six steps",
  "Guarda il video": "Watch the video", "Beeweat — presentazione": "Beeweat — introduction", "Beeweat v": "Beeweat v", "v": "v",
  "Area riservata": "Admin area", "Il cruscotto degli amministratori: api, cieli, assistenza, segnalazioni": "The administrators' dashboard: bees, skies, support, reports",
  "Vuoi diventare amministratore?": "Do you want to become an administrator?", "Si diventa amministratori solo con il consenso di entrambi: decidi tu.": "You become an administrator only if both agree: it's up to you.",
  "Potrai gestire api, cieli, segnalazioni e assistenza dall'Area riservata.": "You'll be able to manage bees, skies, reports and support from the Admin area.",
  "Benvenuto tra gli amministratori dell'alveare 👑\nTrovi l'Area riservata nel tuo Profilo.": "Welcome among the hive's administrators 👑\nYou'll find the Admin area in your Profile.",
  "Non sono riuscito a registrare la risposta: ": "I couldn't record the answer: ", "Invito": "Invitation",
  "Servizio non destinato a minori di 14 anni.": "Service not intended for people under 14.", "Termini di Servizio": "Terms of Service", "Informativa sulla Privacy": "Privacy Policy",
  "Leggi i termini che regolano l'uso di Beeweat.": "Read the terms that govern the use of Beeweat.", "Continuando accetti i": "By continuing you accept the",
  "e l'": "and the ", "Ho letto e accetto i": "I have read and accept the", "Ho letto e accetto": "I have read and accept",
  "Ho letto e accetto i Termini di Servizio e l'Informativa sulla Privacy": "I have read and accept the Terms of Service and the Privacy Policy",
  "Per registrarti devi accettare i Termini di Servizio e l'informativa sulla privacy.": "To sign up you must accept the Terms of Service and the privacy policy.",
  "Elimina account": "Delete account", "Elimina il mio account": "Delete my account", "Elimina definitivamente": "Delete permanently",
  "Annulla, tengo l'account": "Cancel, I'm keeping the account", "Per confermare scrivi ELIMINA": "To confirm, type ELIMINA",
  "È definitivo e immediato. Spariscono per sempre:": "It is final and immediate. Gone forever:", "il profilo, l'email e la password": "the profile, email and password",
  "i messaggi, le chat e i gruppi che hai creato": "the messages, chats and groups you created", "gli eventi pubblicati, i seguiti e i follower": "the published events, follows and followers",
  "Restano solo i numeri anonimi delle statistiche dell'alveare. Non si può annullare: per tornare dovrai registrarti di nuovo.": "Only the anonymous numbers of the hive statistics remain. It can't be undone: to come back you'll have to sign up again.",
  "Seconda conferma: procedere davvero con l'eliminazione definitiva?": "Second confirmation: really proceed with permanent deletion?",
  "Il tuo account è stato eliminato. Grazie per i cieli che hai condiviso con l'alveare. 🐝": "Your account has been deleted. Thank you for the skies you shared with the hive. 🐝",
  "Non sono riuscito a eliminare l'account: ": "I couldn't delete the account: ", "Identificativo utente mancante.": "Missing user id.", "Utente non identificabile.": "User can't be identified.",

  // notifiche
  "Cosa notificare": "What to notify", "Push sul telefono": "Push on the phone", "Abilita notifiche": "Enable notifications", "Orari di silenzio": "Quiet hours",
  "Non disturbare (22:00 – 8:00)": "Do not disturb (22:00 – 8:00)", "Nessuna notifica durante la notte": "No notifications at night",
  "Attive su questo dispositivo ✓": "Active on this device ✓", "Da attivare su questo dispositivo": "To be enabled on this device", "Da richiedere": "To be requested",
  "Permesso concesso": "Permission granted", "Permesso non ancora richiesto": "Permission not yet requested", "Permesso negato dal browser": "Permission denied by the browser",
  "Consentito ✓": "Allowed ✓", "Notifiche consentite ✓": "Notifications allowed ✓", "Fotocamera consentita ✓": "Camera allowed ✓", "Posizione consentita ✓": "Location allowed ✓",
  "Negato dal sistema · sbloccalo nelle impostazioni del browser": "Denied by the system · unlock it in the browser settings",
  "Negato dal sistema · Impostazioni iPhone → Privacy → Localizzazione → Siti web Safari, e Impostazioni → Safari": "Denied by the system · iPhone Settings → Privacy → Location → Safari Websites, and Settings → Safari",
  "Bloccate dal browser (sbloccale nelle impostazioni del sito)": "Blocked by the browser (unblock them in the site settings)", "Non supportate qui (iPhone: aggiungi ad Home)": "Not supported here (iPhone: add to Home)",
  "Non supportato in questo contesto": "Not supported in this context", "Notifiche non supportate in questo browser.": "Notifications not supported in this browser.",
  "Questo browser non supporta le push. Su iPhone: aggiungi prima Beeweat alla schermata Home.": "This browser doesn't support push. On iPhone: first add Beeweat to the Home screen.",
  "Attivazione push non riuscita": "Push activation failed", "Chiave VAPID mancante nel file (vedi istruzioni).": "VAPID key missing in the file (see instructions).",
  "Le notifiche di prossimità usano la tua posizione e richiedono il permesso del dispositivo. Le notifiche push reali funzionano solo con l'app installata dallo store; in anteprima questa è una simulazione delle impostazioni.": "Proximity notifications use your location and need the device's permission. Real push notifications only work with the app installed from the store; in preview this is a simulation of the settings.",
  "Sempre attiva · zona di ~1 km, mai la casa. Se il telefono la nega: Impostazioni → Safari → Posizione → Consenti": "Always on · ~1 km area, never your home. If the phone denies it: Settings → Safari → Location → Allow",
  "≈ zona di 1 km · mai la tua casa": "≈ 1 km area · never your home", "Beeweat vede solo la zona (circa 1 km), mai la tua casa.": "Beeweat only sees the area (about 1 km), never your home.",
  "La fotocamera si accende solo quando la apri tu, mai di nascosto.": "The camera only turns on when you open it, never secretly.", "Fotocamera": "Camera",
  "Attiva la posizione": "Turn on location", "Posizione non rilevata": "Location not detected", "Posizione non ottenuta: ": "Location not obtained: ",
  "GPS non disponibile in questo browser.": "GPS not available in this browser.", "posizione: la chiediamo allo scatto": "location: we ask for it at the shot",
  "Consenti la geolocalizzazione al sito (icona del lucchetto nella barra → Posizione → Consenti, poi ricarica).": "Allow geolocation for the site (padlock icon in the bar → Location → Allow, then reload).",
  "Il sistema ha memorizzato il rifiuto e non rimostra la domanda.\nSblocca a mano: icona 🔒 nella barra dell'indirizzo → Autorizzazioni → Consenti, poi ricarica.\nSu iPhone: Impostazioni → Safari → (Posizione / Fotocamera) → Consenti.": "The system remembered the refusal and won't ask again.\nUnlock it by hand: 🔒 icon in the address bar → Permissions → Allow, then reload.\nOn iPhone: Settings → Safari → (Location / Camera) → Allow.",
  "Se il telefono non chiede nulla:": "If the phone doesn't ask anything:", "Su iPhone:": "On iPhone:", "Al prossimo passo il telefono ti chiederà conferma: tocca": "At the next step the phone will ask you to confirm: tap",
  "Impostazioni → Privacy → Localizzazione → Siti web Safari → \"Mentre usi l'app\"": "Settings → Privacy → Location → Safari Websites → \"While using the app\"",
  "Impostazioni → Safari → Posizione → \"Chiedi\"": "Settings → Safari → Location → \"Ask\"", "Mentre usi l'app": "While using the app",

  // fotocamera e pubblicazione
  "Apri la fotocamera 📸": "Open the camera 📸", "Si apre la fotocamera del telefono · mai dall'archivio": "The phone camera opens · never from the gallery",
  "Solo cielo, mare e natura, scattati adesso.": "Only sky, sea and nature, shot right now.", "Solo natura, cielo e mare": "Only nature, sky and sea",
  "Scattato adesso, dal vivo. Le foto con persone in primo piano vengono scartate dagli occhi dell'alveare.": "Shot right now, live. Photos with people in the foreground are discarded by the eyes of the hive.",
  "Solo scatti dal vivo: niente foto dall'archivio, così ogni cielo è autentico e di adesso.": "Live shots only: no photos from the gallery, so every sky is authentic and of this moment.",
  "Le foto di Beeweat si scattano in verticale: il cielo ha bisogno d'altezza.": "Beeweat photos are taken in portrait: the sky needs height.", "Ruota il telefono in verticale": "Rotate the phone to portrait",
  "(oppure tocca di nuovo)": "(or tap again)", "Racconta com'è il cielo qui adesso: lo leggono tutte le api del posto.": "Tell how the sky is here right now: all the local bees read it.",
  "Scegli la condizione, scrivi se vuoi, poi Pubblica: controllo modello, descrizione, scelta e foto, e il cielo parte.": "Choose the condition, write if you like, then Publish: I check the model, description, choice and photo, and the sky takes off.",
  "Occhi dell'alveare: pronti": "Eyes of the hive: ready", "Occhi dell'alveare al lavoro": "Eyes of the hive at work", "Gli occhi dell'alveare stanno guardando la foto…": "The eyes of the hive are looking at the photo…",
  "Sembra proprio un cielo": "It really looks like a sky", "Cielo, mare, natura… il controllo continua da solo.": "Sky, sea, nature… the check carries on by itself.",
  "Questo cielo non passa": "This sky doesn't pass", "Non pubblicabile": "Can't be published", "Puoi pubblicare lo stesso": "You can publish anyway",
  "Puoi pubblicare lo stesso: il controllo avverrà in coda.": "You can publish anyway: the check will happen in the queue.", "Un attimo: il cielo parte appena il controllo è finito.": "One moment: the sky takes off as soon as the check is done.",
  "L'analisi sta impiegando troppo": "The analysis is taking too long", "Occhi AI non disponibili": "AI eyes not available", "Occhi AI non disponibili in questo momento.": "AI eyes not available right now.",
  ": il controllo avverrà in coda, dietro le quinte (o tocca qui per riprovare subito).": ": the check will happen in the queue, behind the scenes (or tap here to retry now).",
  ": il controllo continua da solo dietro le quinte.": ": the check carries on by itself behind the scenes.",
  "— pubblica pure: il controllo continua dietro le quinte e la foto parte da sola tra pochi istanti.": "— go ahead and publish: the check carries on behind the scenes and the photo leaves on its own in a few moments.",
  "— pubblica pure: la foto va nello zaino, sarà controllata e spedita da sola al ritorno della linea.": "— go ahead and publish: the photo goes in the backpack, it will be checked and sent on its own when the connection is back.",
  "Caso difficile: sto chiedendo il": "Tricky case: I'm asking for the", "a Bee-Eye…": "from Bee-Eye…", "Bee-Eye 👁️: ": "Bee-Eye 👁️: ",
  "Bee-Eye 👁️: c'è una persona in primo piano. Inquadra il cielo, non le persone.": "Bee-Eye 👁️: there's a person in the foreground. Frame the sky, not people.",
  "Bee-Eye 👁️: non vedo un cielo vero, sembra una parete o un soffitto. Inquadra il cielo. 🌤️": "Bee-Eye 👁️: I don't see a real sky, it looks like a wall or a ceiling. Frame the sky. 🌤️",
  "Bee-Eye 👁️: sembra uno schermo o una foto ri-fotografata. Serve il cielo vero. 📵": "Bee-Eye 👁️: it looks like a screen or a re-photographed picture. The real sky is needed. 📵",
  "sembra uno schermo o una foto ri-fotografata": "it looks like a screen or a re-photographed picture",
  "Persona in primo piano rilevata: per la privacy, le persone vanno bene solo da lontano, come parte del paesaggio. 📷": "Person in the foreground detected: for privacy, people are fine only from afar, as part of the landscape. 📷",
  "Contenuto non adatto rilevato. Beeweat è per il cielo. 🌤️": "Unsuitable content detected. Beeweat is for the sky. 🌤️",
  "Questa sembra una scena d'interni. Inquadra il cielo vero. 🌤️": "This looks like an indoor scene. Frame the real sky. 🌤️",
  "Non vedo cielo nell'inquadratura: alza un po' l'obiettivo e fai entrare più cielo nella foto. 🌤️": "I don't see sky in the frame: raise the lens a little and let more sky into the photo. 🌤️",
  "Non riesco a confermare che sia cielo (l'occhio dell'alveare non risponde). Riprova tra un momento, o inquadra più cielo. 🌤️": "I can't confirm it's sky (the eye of the hive isn't answering). Try again in a moment, or frame more sky. 🌤️",
  "È buio a quest'ora: un cielo così chiaro non torna. Sembra un interno o una luce artificiale. 🌙": "It's dark at this hour: such a bright sky doesn't add up. It looks like an interior or artificial light. 🌙",
  "Foto non leggibile.\nScatta di nuovo.": "Photo not readable.\nShoot again.", "Grazie per il tuo cielo! L'alveare lo vede già.": "Thank you for your sky! The hive can already see it.",
  "Pubblicazione non riuscita": "Publishing failed", "Fotocamera non ottenuta": "Camera not obtained", "Fotocamera non avviabile: ": "Camera can't start: ",
  "Nessuna fotocamera trovata su questo dispositivo.": "No camera found on this device.", "La fotocamera è occupata da un'altra app: chiudila e riprova.": "The camera is in use by another app: close it and try again.",
  "Fotocamera non disponibile in questo browser (se sei in WhatsApp/Instagram: apri in Safari o Chrome).": "Camera not available in this browser (if you're in WhatsApp/Instagram: open in Safari or Chrome).",
  "Permesso fotocamera negato (ora o in passato). Riattivalo: icona 🔒 nella barra dell'indirizzo → Autorizzazioni → Fotocamera → Consenti. Su iPhone: Impostazioni → Safari → Fotocamera → Consenti.": "Camera permission denied (now or in the past). Turn it back on: 🔒 icon in the address bar → Permissions → Camera → Allow. On iPhone: Settings → Safari → Camera → Allow.",
  "Questo browser non dà accesso alla fotocamera. Succede nei browser interni di WhatsApp, Instagram o Facebook: apri app.beeweat.com direttamente in Safari o Chrome (tocca ⋯ → \"Apri nel browser\").": "This browser doesn't give access to the camera. It happens in the in-app browsers of WhatsApp, Instagram or Facebook: open app.beeweat.com directly in Safari or Chrome (tap ⋯ → \"Open in browser\").",
  "Memoria piena: non riesco a conservare il post offline. Riprova quando torna la rete.": "Storage full: I can't keep the post offline. Try again when the connection is back.",
  "📡 Sei senza rete: il post è al sicuro nello zaino e partirà da solo appena torna la connessione. 🎒": "📡 You're offline: the post is safe in the backpack and will leave on its own as soon as the connection is back. 🎒",
  "🎒 Alcuni post nello zaino non riescono a partire (": "🎒 Some posts in the backpack can't leave (", "chiudi del tutto l'app e riaprila": "close the app completely and reopen it",
  "Beeweat pubblica solo cieli con il loro posto vero. Su iPhone: Impostazioni → Privacy → Localizzazione → Siti web Safari → \"Mentre usi l'app\", poi Impostazioni → Safari → Posizione → Chiedi. Su Android: icona 🔒 nella barra → Posizione → Consenti. Poi ricarica l'app.": "Beeweat only publishes skies with their true place. On iPhone: Settings → Privacy → Location → Safari Websites → \"While using the app\", then Settings → Safari → Location → Ask. On Android: 🔒 icon in the bar → Location → Allow. Then reload the app.",

  // accesso e registrazione
  "Entra usando la tua Email": "Sign in with your email", "Come vuoi farti chiamare": "What should we call you", "Città (es. Napoli)": "City (e.g. Naples)",
  "Almeno 8 caratteri": "At least 8 characters", "Password dimenticata?": "Forgotten password?", "Reimposta la password": "Reset the password",
  "Invia link di reimpostazione": "Send reset link", "Torna all'accesso": "Back to sign in", "Controlla la tua email": "Check your email",
  "Inserisci l'email del tuo account: ti invieremo un link sicuro per reimpostare la password.": "Enter your account email: we'll send you a secure link to reset the password.",
  "è associata a un account Beeweat, riceverai un'email con un": "is linked to a Beeweat account, you'll get an email with a", "per reimpostare la password.": "to reset the password.",
  "Il link è valido per": "The link is valid for", "Per la tua sicurezza non comunichiamo se un'email è registrata o meno.": "For your safety we don't say whether an email is registered or not.",
  "Link di reimpostazione riconosciuto 🐝\nScegli la NUOVA password (minimo 6 caratteri):": "Reset link recognised 🐝\nChoose the NEW password (at least 6 characters):",
  "Password aggiornata ✓ D'ora in poi accedi con quella nuova.": "Password updated ✓ From now on sign in with the new one.", "Password troppo corta: riapri il link e riprova.": "Password too short: open the link again and retry.",
  "Email o password errati.": "Wrong email or password.", "Email già registrata: prova ad accedere.": "Email already registered: try signing in.",
  "Devi prima confermare l'email: controlla la posta.": "You must confirm your email first: check your inbox.", "Registrazione inviata! Controlla la tua email e conferma il link, poi accedi.": "Sign-up sent! Check your email and confirm the link, then sign in.",
  "La tua sessione non è più valida: accedi di nuovo per continuare. 🐝": "Your session is no longer valid: sign in again to continue. 🐝", "Account sospeso": "Account suspended",
  "Il tuo account è stato temporaneamente sospeso.": "Your account has been temporarily suspended.", "Il server non risponde. Controlla la connessione e riprova tra qualche secondo.": "The server isn't responding. Check the connection and try again in a few seconds.",
  "Impossibile raggiungere il server: controlla che il progetto Supabase sia attivo (non in pausa) e l'URL delle chiavi.": "Can't reach the server: check that the Supabase project is active (not paused) and the keys' URL.",
  "Attendere…": "Please wait…", "Riprova tra poco.": "Try again shortly.", "Errore: ": "Error: ", "Ops, l'alveare è inciampato": "Oops, the hive tripped",
  "Fai uno screenshot di questo messaggio e mandalo agli sviluppatori:": "Take a screenshot of this message and send it to the developers:", "Ricarica Beeweat": "Reload Beeweat",
  "Aggiornamento non riuscito": "Update failed", "Aggiornamento non riuscito: chiudi e riapri l'app": "Update failed: close and reopen the app", "✓ Fatto": "✓ Done",
  "Beeweat è il meteo fatto dalle persone: ogni foto è un'ape che torna all'alveare con una notizia. Più siamo, più il tempo vero si compone.": "Beeweat is weather made by people: every photo is a bee coming back to the hive with news. The more we are, the more the real weather takes shape.",
  "Buon volo, ape 🐝": "Fly well, bee 🐝", "Beeweat 🐝": "Beeweat 🐝", "È pronta": "It's ready",

  // intro e FAQ
  "Gli occhi dell'alveare accettano solo cieli veri, scattati dal vivo: niente persone in primo piano, schermi, interni, muri o superfici. Alza l'obiettivo e fai entrare più cielo nell'inquadratura.": "The eyes of the hive accept only real skies, shot live: no people in the foreground, screens, interiors, walls or surfaces. Raise the lens and let more sky into the frame.",
  "Tocca il + e fotografa il cielo sopra di te — solo dal vivo, niente archivio. È la regola d'oro: ogni cielo è vero e di adesso.": "Tap the + and photograph the sky above you — live only, no gallery. It's the golden rule: every sky is real and of this moment.",
  "Prima di pubblicare, l'intelligenza artificiale controlla la foto: niente persone in primo piano, schermi o interni. Nei casi dubbi chiede un secondo parere a Bee-Eye, il giudice in cloud.": "Before publishing, the artificial intelligence checks the photo: no people in the foreground, screens or interiors. In doubtful cases it asks Bee-Eye, the judge in the cloud, for a second opinion.",
  "Radar e Feed": "Radar and Feed", "Il Feed mostra i cieli nel tuo raggio (lo regoli con il cursore in basso, da 100 metri a 100 km). Il Radar disegna maltempo ed eventi intorno a te, in tempo reale.": "The Feed shows the skies within your radius (set it with the slider at the bottom, from 100 metres to 100 km). The Radar draws bad weather and events around you, in real time.",
  "Segnala temporali, mareggiate, strade chiuse. Un post \"Temporale\" crea da solo un'allerta per le api vicine. Le allerte vivono nella pagina Eventi.": "Report thunderstorms, sea storms, closed roads. A \"Thunderstorm\" post creates an alert for nearby bees by itself. Alerts live in the Events page.",
  "BeeWorld e le stelle": "BeeWorld and the stars", "Segui le api e i luoghi che ti interessano: ogni loro cielo ti arriva in campanella. Una stella ogni 20 cieli pubblicati: da Scout Bee a Queen Bee.": "Follow the bees and places you care about: each of their skies rings your bell. One star every 20 skies published: from Scout Bee to Queen Bee.",
  "Lo zaino offline": "The offline backpack", "Lo zaino: le foto in attesa partono da sole": "The backpack: pending photos leave on their own",
  "Senza rete? Pubblica lo stesso: il post resta nello zaino e parte da solo al ritorno della linea. In montagna, in barca, ovunque.": "No signal? Publish anyway: the post stays in the backpack and leaves on its own when the connection is back. In the mountains, on a boat, anywhere.",
  "Cosa vede Beeweat della mia posizione?": "What does Beeweat see of my location?", "La posizione non viene rilevata": "Location isn't detected", "La fotocamera non si apre": "The camera doesn't open",
  "La mia foto è stata respinta": "My photo was rejected", "Ho pubblicato senza rete, dov'è il post?": "I published offline, where's the post?", "Non ricevo le notifiche": "I don't get notifications",
  "Cosa sono le stelle sull'avatar?": "What are the stars on the avatar?", "Come funzionano le spunte nelle chat?": "How do the ticks in chats work?", "Come installo Beeweat sul telefono?": "How do I install Beeweat on the phone?",
  "La zona, mai la tua casa. Beeweat usa la posizione del telefono, che chiede il permesso la prima volta: le coordinate vengono arrotondate sul telefono a circa 1 km prima di partire, e sul server e sulla mappa arriva solo la zona. Senza posizione non si pubblica (feed, Radar e BeeCast lavorano sullo stesso punto). Se l'hai negata: Impostazioni → Safari → Posizione → Consenti.": "The area, never your home. Beeweat uses the phone's location, which asks for permission the first time: the coordinates are rounded on the phone to about 1 km before leaving, and only the area reaches the server and the map. Without location you can't publish (feed, Radar and BeeCast work on the same spot). If you denied it: Settings → Safari → Location → Allow.",
  "Dal browser interno di WhatsApp/Instagram la fotocamera non funziona: apri app.beeweat.com in Safari o Chrome. Se il permesso è stato negato: icona 🔒 nella barra → Fotocamera → Consenti (su iPhone: Impostazioni → Safari → Fotocamera).": "From the in-app browser of WhatsApp/Instagram the camera doesn't work: open app.beeweat.com in Safari or Chrome. If permission was denied: 🔒 icon in the bar → Camera → Allow (on iPhone: Settings → Safari → Camera).",
  "È nello zaino 🎒: resta al sicuro sul telefono e parte da solo appena torna la connessione (viene controllato prima di partire). Lo vedi nel feed con l'etichetta \"in attesa di rete\".": "It's in the backpack 🎒: it stays safe on the phone and leaves on its own as soon as the connection is back (it's checked before leaving). You see it in the feed with the label \"waiting for network\".",
  "Su iPhone le notifiche push funzionano solo con l'app installata: Condividi ⬆️ → Aggiungi alla schermata Home. Poi Profilo → Configurazione → Push sul telefono → Attiva.": "On iPhone push notifications only work with the app installed: Share ⬆️ → Add to Home Screen. Then Profile → Settings → Push on the phone → Turn on.",
  "Sono i gradi dell'alveare: una stella ogni 20 cieli pubblicati. Scout Bee (20), Worker Bee (40), Guard Bee (60), Royal Bee (80), Queen Bee (100+).": "They are the hive's ranks: one star every 20 skies published. Scout Bee (20), Worker Bee (40), Guard Bee (60), Royal Bee (80), Queen Bee (100+).",
  "✓ Inviato, ✓✓ Consegnato sul telefono dell'altra ape, ✓✓ dorate = Letto. Puoi disattivare la conferma di lettura dal profilo: gli altri non vedranno più quando leggi.": "✓ Sent, ✓✓ Delivered to the other bee's phone, golden ✓✓ = Read. You can turn off read receipts from the profile: others will no longer see when you read.",
  "iPhone: Safari → Condividi ⬆️ → Aggiungi alla schermata Home. Android: Chrome → menù ⋮ → Installa app. Avrai lo schermo intero, i permessi stabili e le notifiche.": "iPhone: Safari → Share ⬆️ → Add to Home Screen. Android: Chrome → menu ⋮ → Install app. You'll get full screen, stable permissions and notifications.",
  "Ogni cielo che fotografi diventa meteo vero per tutti — la nuvola che vedi tu, nessun satellite la vede così.": "Every sky you photograph becomes real weather for everyone — the cloud you see, no satellite sees it like that.",

  // gradi e premi
  "Complimenti! 🎉": "Congratulations! 🎉", "Hai preso il volo! 🐝 La prima stella è tua: l'alveare ha un'osservatrice in più.": "You've taken flight! 🐝 The first star is yours: the hive has one more observer.",
  "Il tuo ronzio si sente lontano! Due stelle: i tuoi cieli fanno ormai parte del tempo di tutti.": "Your buzz can be heard far away! Two stars: your skies are now part of everyone's weather.",
  "Sentinella dell'alveare! Tre stelle: quando guardi il cielo, gli altri sanno che tempo fa.": "Sentinel of the hive! Three stars: when you look at the sky, others know what the weather is.",
  "Volo reale! Quattro stelle: sei tra le api che tengono in piedi la mappa del cielo.": "Royal flight! Four stars: you're among the bees who keep the sky map standing.",
  "Regina dell'alveare 👑 Cinque stelle: cento cieli raccontati, e il tempo di tutti è più vero grazie a te.": "Queen of the hive 👑 Five stars: a hundred skies told, and everyone's weather is truer thanks to you.",

  // privacy e termini (titoli)
  "1. Titolare del trattamento": "1. Data controller", "2. Dati personali raccolti": "2. Personal data collected", "3. Finalità del trattamento": "3. Purposes of processing",
  "4. Base giuridica": "4. Legal basis", "5. Geolocalizzazione e fotocamera": "5. Geolocation and camera", "6. Conservazione dei dati": "6. Data retention",
  "7. Comunicazione e condivisione": "7. Communication and sharing", "8. Trasferimento dati extra-UE": "8. Transfers outside the EU", "9. I tuoi diritti": "9. Your rights",
  "10. Minori": "10. Minors", "11. Sicurezza": "11. Security", "12. Modifiche": "12. Changes", "13. Contatti": "13. Contacts",
  "1. Accettazione dei Termini": "1. Acceptance of the Terms", "2. Descrizione del servizio": "2. Description of the service", "3. Account e registrazione": "3. Account and sign-up",
  "4. Regole di condotta": "4. Rules of conduct", "5. Contenuti degli utenti": "5. User content", "6. Fotocamera e posizione": "6. Camera and location",
  "7. Eventi e segnalazioni": "7. Events and reports", "8. Dati meteo": "8. Weather data", "9. Proprietà intellettuale": "9. Intellectual property",
  "10. Sospensione e cessazione": "10. Suspension and termination", "11. Esclusione di garanzie": "11. Disclaimer of warranties", "12. Limitazione di responsabilità": "12. Limitation of liability",
  "13. Modifiche ai Termini": "13. Changes to the Terms", "14. Legge applicabile e foro": "14. Governing law and jurisdiction", "15. Contatti": "15. Contacts",
  "Beeweat tiene alla tua privacy. Di seguito trovi l'informativa completa sul trattamento dei dati personali ai sensi del Regolamento (UE) 2016/679 (GDPR).": "Beeweat cares about your privacy. Below you'll find the full notice on the processing of personal data under Regulation (EU) 2016/679 (GDPR).",
  // privacy (testi)
  "Il Titolare del trattamento dei dati è Beeweat (di seguito \"l'App\"). Per qualsiasi richiesta relativa ai tuoi dati personali puoi scrivere all'indirizzo privacy@beeweat.com. La presente informativa è resa ai sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679 (GDPR).": "The data controller is Beeweat (hereinafter \"the App\"). For any request about your personal data you can write to privacy@beeweat.com. This notice is provided under articles 13 and 14 of Regulation (EU) 2016/679 (GDPR).",
  "Raccogliamo: (a) dati di registrazione (nome, città, email, password cifrata); (b) immagine del profilo (emoji o foto da te caricata); (c) dati di geolocalizzazione, se autorizzi l'accesso, per mostrarti il meteo e i contenuti vicino a te; (d) fotografie scattate in tempo reale tramite la fotocamera e da te pubblicate; (e) contenuti generati (post, didascalie, messaggi in chat, segnalazioni di eventi, like/stelle); (f) dati tecnici e di utilizzo (modello dispositivo, sistema operativo, log di accesso).": "We collect: (a) sign-up data (name, city, email, encrypted password); (b) profile picture (emoji or a photo you upload); (c) geolocation data, if you allow access, to show you the weather and content near you; (d) photos taken in real time with the camera and published by you; (e) generated content (posts, captions, chat messages, event reports, likes/stars); (f) technical and usage data (device model, operating system, access logs).",
  "I dati sono trattati per: erogare il servizio e gestire il tuo account; mostrare meteo, post ed eventi nel raggio selezionato; consentire chat e interazioni tra utenti; garantire sicurezza, prevenzione abusi e moderazione; adempiere a obblighi di legge. Le foto sono acquisite esclusivamente in tempo reale dalla fotocamera e non dall'archivio del dispositivo.": "Data are processed to: provide the service and manage your account; show weather, posts and events within the selected radius; enable chat and interactions between users; ensure security, abuse prevention and moderation; comply with legal obligations. Photos are acquired exclusively in real time from the camera and not from the device's gallery.",
  "Il trattamento si fonda su: l'esecuzione del contratto (fornitura del servizio, art. 6.1.b GDPR); il tuo consenso per geolocalizzazione e fotocamera (art. 6.1.a), revocabile in qualsiasi momento dalle impostazioni del dispositivo; il legittimo interesse alla sicurezza della piattaforma (art. 6.1.f); eventuali obblighi legali (art. 6.1.c).": "Processing is based on: performance of the contract (provision of the service, art. 6.1.b GDPR); your consent for geolocation and camera (art. 6.1.a), revocable at any time from the device settings; legitimate interest in the security of the platform (art. 6.1.f); any legal obligations (art. 6.1.c).",
  "L'accesso alla posizione e alla fotocamera è facoltativo e richiede un tuo consenso esplicito tramite il sistema operativo. Puoi negarlo o revocarlo in ogni momento; alcune funzioni (radar, pubblicazione di post, segnalazione eventi con posizione) potrebbero risultare limitate. La posizione precisa è usata solo quando attivi le relative funzioni.": "Access to location and camera is optional and requires your explicit consent through the operating system. You can deny or revoke it at any time; some functions (radar, publishing posts, reporting events with location) may be limited. The precise location is used only when you activate the related functions.",
  "I dati dell'account sono conservati finché mantieni attivo il profilo. I cieli (foto e video) restano nei reel pubblici per il mese in corso e quello precedente, poi passano nello storico personale consultabile dal Profilo, dove sono conservati finché il profilo è attivo o finché non li elimini tu; i contenuti segnalati possono essere conservati fino alla fine della verifica. Dalle foto possono essere derivati dati meteorologici aggregati e anonimi (condizione osservata, zona, orario), privi di riferimenti personali, conservati per migliorare le previsioni collaborative. Se elimini un post o l'account, la rimozione dei dati personali è immediata, salvo obblighi di conservazione di legge e tempi tecnici di rotazione dei backup.": "Account data are kept as long as you keep the profile active. Skies (photos and videos) stay in the public reels for the current month and the previous one, then move to the personal archive available from the Profile, where they are kept as long as the profile is active or until you delete them; reported content may be kept until the review is complete. Aggregated, anonymous weather data (observed condition, area, time), free of personal references, may be derived from the photos and kept to improve collaborative forecasts. If you delete a post or the account, personal data are removed immediately, except for legal retention obligations and technical backup rotation times.",
  "I contenuti che pubblichi (post, foto, eventi, profilo) sono visibili agli altri utenti secondo le impostazioni di visibilità. I dati possono essere trattati da fornitori di servizi (hosting, infrastruttura cloud, servizi mappe e meteo) nominati responsabili del trattamento. Non vendiamo i tuoi dati personali a terzi e non mostriamo pubblicità di inserzionisti all'interno dei contenuti.": "The content you publish (posts, photos, events, profile) is visible to other users according to the visibility settings. Data may be processed by service providers (hosting, cloud infrastructure, map and weather services) appointed as processors. We don't sell your personal data to third parties and we don't show advertisers' ads within the content.",
  "Qualora i dati siano trasferiti fuori dallo Spazio Economico Europeo, ciò avverrà solo verso Paesi con decisione di adeguatezza oppure adottando garanzie adeguate (es. Clausole Contrattuali Standard della Commissione Europea).": "Should data be transferred outside the European Economic Area, this will happen only to countries with an adequacy decision or by adopting appropriate safeguards (e.g. the European Commission's Standard Contractual Clauses).",
  "In qualità di interessato hai diritto di: accesso ai dati (art. 15); rettifica (art. 16); cancellazione/oblio (art. 17); limitazione (art. 18); portabilità (art. 20); opposizione (art. 21); revoca del consenso in qualsiasi momento. Hai inoltre diritto di proporre reclamo all'Autorità Garante per la protezione dei dati personali. Per esercitare i diritti scrivi a privacy@beeweat.com.": "As a data subject you have the right to: access your data (art. 15); rectification (art. 16); erasure/right to be forgotten (art. 17); restriction (art. 18); portability (art. 20); objection (art. 21); withdrawal of consent at any time. You also have the right to lodge a complaint with the Data Protection Authority. To exercise your rights write to privacy@beeweat.com.",
  "Il servizio non è destinato a minori di 14 anni (o all'età minima prevista dalla normativa locale). Per i minori è richiesto il consenso di chi esercita la responsabilità genitoriale. Non raccogliamo consapevolmente dati di minori al di sotto di tale età.": "The service is not intended for people under 14 (or the minimum age set by local law). For minors, the consent of the holder of parental responsibility is required. We don't knowingly collect data of minors below that age.",
  "Adottiamo misure tecniche e organizzative adeguate (cifratura delle credenziali, controlli di accesso, trasmissione protetta) per proteggere i dati da accessi non autorizzati, perdita o divulgazione.": "We adopt appropriate technical and organisational measures (credential encryption, access controls, protected transmission) to protect data from unauthorised access, loss or disclosure.",
  "La presente informativa può essere aggiornata. In caso di modifiche sostanziali ti informeremo tramite l'App. L'uso continuato del servizio dopo l'aggiornamento implica presa visione della versione vigente.": "This notice may be updated. In case of substantial changes we'll inform you through the App. Continued use of the service after the update implies acknowledgement of the current version.",
  "Per domande o richieste sulla privacy: privacy@beeweat.com. Ultimo aggiornamento: maggio 2026.": "For privacy questions or requests: privacy@beeweat.com. Last update: May 2026.",
  // termini (testi)
  "Utilizzando Beeweat accetti integralmente i presenti Termini di Servizio. Se non li accetti, ti invitiamo a non utilizzare l'App. I Termini costituiscono un accordo vincolante tra te e Beeweat.": "By using Beeweat you fully accept these Terms of Service. If you don't accept them, please don't use the App. The Terms are a binding agreement between you and Beeweat.",
  "Beeweat è una piattaforma social di meteo collaborativo che consente di pubblicare osservazioni meteo in tempo reale, visualizzare contenuti nelle vicinanze tramite il radar, interagire con altri utenti tramite chat, like e segnalazioni di eventi.": "Beeweat is a collaborative-weather social platform that lets you publish weather observations in real time, view nearby content through the radar, and interact with other users through chat, likes and event reports.",
  "Per usare le funzioni complete devi registrarti fornendo dati veritieri e mantenere riservate le credenziali. Sei responsabile delle attività svolte tramite il tuo account. Devi avere almeno 14 anni (o l'età minima prevista localmente) per registrarti.": "To use the full features you must sign up providing truthful data and keep your credentials confidential. You are responsible for the activities carried out through your account. You must be at least 14 (or the locally required minimum age) to sign up.",
  "Ti impegni a non pubblicare contenuti illeciti, offensivi, diffamatori, osceni, violenti, discriminatori o che violino diritti altrui; a non molestare altri utenti; a non diffondere spam, informazioni false o fuorvianti; a non tentare accessi non autorizzati o compromettere la sicurezza della piattaforma.": "You agree not to publish unlawful, offensive, defamatory, obscene, violent, discriminatory content or content that violates others' rights; not to harass other users; not to spread spam, false or misleading information; not to attempt unauthorised access or compromise the security of the platform.",
  "Le foto possono essere acquisite esclusivamente in tempo reale tramite la fotocamera: non è consentito il caricamento dalla galleria per i post. L'uso di fotocamera e geolocalizzazione richiede il tuo consenso ed è soggetto ai permessi del sistema operativo.": "Photos can be acquired exclusively in real time through the camera: uploading from the gallery is not allowed for posts. Use of camera and geolocation requires your consent and is subject to the operating system's permissions.",
  "Le segnalazioni di eventi (temporali, mareggiate, attenzione, incidenti, soccorso, ecc.) sono generate dagli utenti a titolo informativo e collaborativo. NON costituiscono allerta ufficiale. In caso di pericolo o emergenza reale contatta sempre i numeri di emergenza (112) e le autorità competenti.": "Event reports (thunderstorms, sea storms, warnings, accidents, rescue, etc.) are generated by users for informational and collaborative purposes. They are NOT official alerts. In case of real danger or emergency always contact the emergency numbers (112) and the competent authorities.",
  "Le informazioni meteo derivano da una media di fonti pubbliche e sono fornite a scopo indicativo, senza garanzia di esattezza, completezza o tempestività. Non fare affidamento esclusivo su tali dati per decisioni critiche.": "Weather information comes from an average of public sources and is provided for guidance only, without any guarantee of accuracy, completeness or timeliness. Don't rely exclusively on such data for critical decisions.",
  "Il marchio Beeweat, il logo, il software e gli elementi grafici sono di proprietà del Titolare o dei rispettivi licenzianti e sono protetti dalle leggi vigenti. Non è consentito copiarli o utilizzarli senza autorizzazione.": "The Beeweat trademark, logo, software and graphic elements are the property of the Controller or their respective licensors and are protected by applicable law. Copying or using them without authorisation is not allowed.",
  "Possiamo sospendere o chiudere account che violino i presenti Termini o la legge. Puoi cancellare il tuo account in qualsiasi momento; la cessazione comporta la rimozione dei contenuti secondo quanto previsto nell'Informativa sulla Privacy.": "We may suspend or close accounts that violate these Terms or the law. You can delete your account at any time; termination entails the removal of content as set out in the Privacy Policy.",
  "Il servizio è fornito \"così com'è\" e \"come disponibile\", senza garanzie di funzionamento ininterrotto o privo di errori. Beeweat non garantisce l'accuratezza dei contenuti generati dagli utenti.": "The service is provided \"as is\" and \"as available\", without guarantees of uninterrupted or error-free operation. Beeweat doesn't guarantee the accuracy of user-generated content.",
  "Nei limiti consentiti dalla legge, Beeweat non è responsabile per danni indiretti, incidentali o consequenziali derivanti dall'uso o dall'impossibilità di usare il servizio, né per condotte o contenuti di terzi/altri utenti.": "To the extent permitted by law, Beeweat is not liable for indirect, incidental or consequential damages arising from the use or inability to use the service, nor for the conduct or content of third parties/other users.",
  "Possiamo aggiornare i presenti Termini. In caso di modifiche rilevanti ti informeremo tramite l'App. L'uso continuato dopo l'aggiornamento implica accettazione della versione vigente.": "We may update these Terms. In case of significant changes we'll inform you through the App. Continued use after the update implies acceptance of the current version.",
  "I presenti Termini sono regolati dalla legge italiana. Per i consumatori resta competente il foro del luogo di residenza o domicilio; per gli altri casi è competente il foro indicato dal Titolare nel rispetto delle norme inderogabili.": "These Terms are governed by Italian law. For consumers, the court of the place of residence or domicile remains competent; in other cases the court indicated by the Controller is competent, in compliance with mandatory rules.",
  "Per domande sui Termini di Servizio: legal@beeweat.com. Ultimo aggiornamento: maggio 2026.": "For questions about the Terms of Service: legal@beeweat.com. Last update: May 2026.",

  // mesi e giorni (BeePaper, BeeCast)
  "gennaio": "January", "febbraio": "February", "marzo": "March", "aprile": "April", "maggio": "May", "giugno": "June", "luglio": "July", "agosto": "August",
  "settembre": "September", "ottobre": "October", "novembre": "November", "dicembre": "December",
  "Gennaio": "January", "Febbraio": "February", "Marzo": "March", "Aprile": "April", "Maggio": "May", "Giugno": "June", "Luglio": "July", "Agosto": "August",
  "Settembre": "September", "Ottobre": "October", "Novembre": "November", "Dicembre": "December",
  "dom": "Sun", "lun": "Mon", "mar": "Tue", "mer": "Wed", "gio": "Thu", "ven": "Fri", "sab": "Sat", "oggi": "today", "ieri": "yesterday", "domani": "tomorrow",
  "30 minuti": "30 minutes", "1 anno fa": "1 year ago", "10 anni fa": "10 years ago", "30 giorni fa": "30 days ago",
};

// Parole al plurale/singolare nei contatori ("3 cieli", "1 stella", "2 h fa")
const UNITS = {
  cielo: "sky", cieli: "skies", stella: "star", stelle: "stars", post: "post", posts: "posts", evento: "event", eventi: "events", utente: "user", utenti: "users",
  ape: "bee", api: "bees", foto: "photo", "foto.": "photos", commento: "comment", commenti: "comments", messaggio: "message", messaggi: "messages", membro: "member", membri: "members",
  min: "min", h: "h", ora: "hour", ore: "hours", giorno: "day", giorni: "days", settimana: "week", settimane: "weeks", mese: "month", mesi: "months", anno: "year", anni: "years",
  caratteri: "characters", secondi: "seconds", km: "km", m: "m",
};
const unit = (n, u) => UNITS[u] === undefined ? u : (u === "foto" ? (Number(n) === 1 ? "photo" : "photos") : UNITS[u]);
const MONTHS_RE = "gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre";
const COND_RE = "Sereno|Poco nuvoloso|Molto nuvoloso|Nuvoloso|Coperto|Pioggia|Pioviggine|Rovesci|Temporale|Neve|Nebbia|Ventoso|Arcobaleno|Maltempo";
const CONF = { alta: "high", media: "medium", bassa: "low" };
const cond = c => trPiece(c);

// ─── REGOLE per i testi con numeri o nomi dentro ───────────────────────────────────────────────
const RULES = [
  [/^Ti avvisiamo se le api nel tuo raggio \((\d+) km\) fotografano pioggia o temporale in avvicinamento\.$/, m => `We'll warn you if bees within your radius (${m[1]} km) photograph rain or a storm approaching.`],
  // 14.81: blocco utente
  [/^Blocca anche (.+)$/, m => `Also block ${m[1]}`],
  [/^Blocca (.+)$/, m => `Block ${m[1]}`],
  [/^Bloccare (.+)\?$/, m => `Block ${m[1]}?`],
  [/^(.+) è stata bloccata\. La sblocchi dal suo profilo quando vuoi\.$/, m => `${m[1]} has been blocked. You can unblock them from their profile any time.`],
  [/^Hai bloccato (.+): per scriverle, sbloccala prima dal suo profilo\.$/, m => `You blocked ${m[1]}: unblock them from their profile first to write to them.`],
  [/^(\d[\d.,]*) km da te$/, m => `${m[1]} km from you`],
  [/^A (\d[\d.,]*) km da te$/, m => `${m[1]} km from you`],
  [/^(\d[\d.,]*) (km|m) da te$/, m => `${m[1]} ${m[2]} from you`],
  [/^entro (\d+) km$/, m => `within ${m[1]} km`],
  [/^Avvisi attivi · entro (\d+) km$/, m => `Active alerts · within ${m[1]} km`],
  [/^Raggio (\d+) km[,:] apri le opzioni$/, m => `Radius ${m[1]} km: open the options`],
  [/^Nessun cielo entro (\d+) km$/, m => `No sky within ${m[1]} km`],
  [/^Nessuna ape entro (\d+) km$/, m => `No bee within ${m[1]} km`],
  [/^(\d+) eventi (social|meteo) (entro (\d+) km|in tutto il mondo)$/, m => `${m[1]} ${m[2] === "meteo" ? "weather" : "social"} event${m[1] === "1" ? "" : "s"} ${m[4] ? `within ${m[4]} km` : "in the whole world"}`],
  [/^(\d+) eventi a (.+)$/, m => `${m[1]} event${m[1] === "1" ? "" : "s"} at ${m[2]}`],
  [/^Nessun evento (social|meteo) entro (\d+) km$/, m => `No ${m[1] === "meteo" ? "weather" : "social"} event within ${m[2]} km`],
  [/^Nessun evento (social|meteo) nel mondo, per ora$/, m => `No ${m[1] === "meteo" ? "weather" : "social"} event in the world, for now`],
  [/^Nessuna foto della community nelle ultime 3 ore entro (\d+) km\. Appena qualcuno pubblica, BeeCast confronta le osservazioni reali con i modelli e corregge la previsione\.$/, m => `No community photos in the last 3 hours within ${m[1]} km. As soon as someone publishes, BeeCast compares real observations with the models and corrects the forecast.`],
  [/^(\d+) foto della community nelle ultime 3 ore entro (\d+) km\. Condizione prevalente: (.+?) \((\d+)%\)\.\s*(.*)$/s, m => `${m[1]} community photos in the last 3 hours within ${m[2]} km. Prevailing condition: ${cond(m[3])} (${m[4]}%). ${tr(m[5])}`],
  [/^Il modello \((.+?)\) è confermato dalle osservazioni reali\.\s*(.*)$/s, m => `The model (${cond(m[1])}) is confirmed by real observations. ${tr(m[2])}`],
  [/^Il modello indica (.+?): le osservazioni raccontano altro e lo correggono\.\s*(.*)$/s, m => `The model says ${cond(m[1])}: the observations tell a different story and correct it. ${tr(m[2])}`],
  [/^(\d+) foto di maltempo entro (\d+) km, ma non dal lato del vento\.$/, m => `${m[1]} bad-weather photos within ${m[2]} km, but not on the wind side.`],
  [/^(\d+) foto di maltempo sopravento \((.+?)\), vento ~(\d+) km\/h\.$/, m => `${m[1]} bad-weather photos upwind (${tr(m[2])}), wind ~${m[3]} km/h.`],
  [/^(.+?) osservata a (\d[\d.,]*) km(.*?), (\d+) min fa$/, m => `${cond(m[1])} observed ${m[2]} km away${m[3]}, ${m[4]} min ago`],
  [/^Maltempo osservato in avvicinamento da (.+?) \(~(\d+) min\)$/, m => `Bad weather seen approaching from ${tr(m[1])} (~${m[2]} min)`],
  [/^Maltempo in arrivo tra ~(\d+) min$/, m => `Bad weather coming in ~${m[1]} min`],
  [/^(.+?) — lo dice la community \((\d+)%\)$/, m => `${cond(m[1])} — says the community (${m[2]}%)`],
  [/^(.+?) a (\d[\d.,]*) km$/, m => DICT[m[1]] ? `${DICT[m[1]]} ${m[2]} km away` : null],
  [/^(Pioggia|pioggia|Neve|Temporale) tra ~(\d+) (h|min)$/, m => `${m[1] === "pioggia" ? "rain" : cond(m[1])} in ~${m[2]} ${m[3]}`],
  [/^Prossime 6 ore: (.+?)\. Apri BeeCast$/, m => `Next 6 hours: ${tr(m[1])}. Open BeeCast`],
  [/^Affidabilità (.+)$/, m => `Confidence ${CONF[m[1]] || tr(m[1])}`],
  [/^(\d+)% (alta|media|bassa)$/, m => `${m[1]}% ${CONF[m[2]]}`],
  [/^il vento non la porta verso di te$/, () => "the wind isn't bringing it towards you"],
  [/^Temporale segnalato a (.+)$/, m => `Thunderstorm reported at ${m[1]}`],
  [/^Controllo (\d)\/4 · (.+)$/, m => `Check ${m[1]}/4 · ${{ "modello del posto": "local model", "la tua descrizione": "your description", "la condizione scelta": "the chosen condition", "la foto (occhi dell'alveare)": "the photo (eyes of the hive)" }[m[2]] || tr(m[2])}`],
  [/^Controllo (\d)\/4…$/, m => `Check ${m[1]}/4…`],
  [/^(\d{1,2}:\d{2}) fa$/, m => m[1]],   // 14.76: «08:11 fa» → «08:11»
  [/^(\d+) (min|h|giorni|giorno|ore|ora|anni|anno|mesi|mese|settimane|settimana) fa$/, m => `${m[1]} ${unit(m[1], m[2])} ago`],
  [/^(\d+) (cieli|cielo|stelle|stella|post|eventi|evento|utenti|utente|api|ape|foto|commenti|commento|messaggi|messaggio|membri|membro|caratteri|secondi|min|h|ore|ora|giorni|giorno|anni|anno)$/, m => `${m[1]} ${unit(m[1], m[2])}`],
  [/^(oggi|ieri) · (.+)$/, m => `${DICT[m[1]]} · ${m[2]}`],
  [/^(\d+) (giorno|giorni)$/, m => `${m[1]} ${Number(m[1]) === 1 ? "day" : "days"}`],
  [/^Apri i commenti \((\d+)\)$/, m => `Open comments (${m[1]})`],
  [/^Apri la chat del posto \((\d+) messaggi\)$/, m => `Open the local chat (${m[1]} messages)`],
  [/^Apri il cielo del (\S+) alle (\S+) a (.+)$/, m => `Open the sky of ${m[1]} at ${m[2]} in ${m[3]}`],
  [/^Apri il cielo del (\S+) · (.+)$/, m => `Open the sky of ${m[1]} · ${m[2]}`],
  [/^Apri (.+)$/, m => `Open ${m[1]}`],
  [/^Post di (.+)$/, m => `Post by ${m[1]}`],
  [/^Profilo di (.+)$/, m => `${m[1]}'s profile`],
  [/^I cieli di (.+)$/, m => `${m[1]}'s skies`],
  [/^Scrivi a (.+?)(…?)$/, m => `Write to ${m[1]}${m[2]}`],
  [/^Ancora niente con (.+)$/, m => `Nothing yet with ${m[1]}`],
  [/^Chat di (.+)$/, m => `${m[1]} chat`],
  [/^Condividi l'evento (.+)$/, m => `Share the event ${m[1]}`],
  [/^Altri (\d+) cieli: apri tutti i tuoi cieli$/, m => `${m[1]} more skies: open all your skies`],
  [/^Altri (\d+) cieli: apri tutti i cieli di (.+)$/, m => `${m[1]} more skies: open all of ${m[2]}'s skies`],
  [/^Eliminare il gruppo (.+)$/, m => `Delete the group ${m[1]}`],
  [/^Eliminare definitivamente l'evento "(.+)"\?\nNon si può annullare\.$/, m => `Permanently delete the event "${m[1]}"?\nIt can't be undone.`],
  [/^Nome del gruppo \(lascia VUOTO per eliminarlo\):$/, () => "Group name (leave EMPTY to delete it):"],
  [/^Inviare a tutti gli utenti Beeweat\?\n\n«(.+)»$/s, m => `Send to all Beeweat users?\n\n«${m[1]}»`],
  [/^📣 Messaggio consegnato a (\d+) api dell'alveare ✓$/, m => `📣 Message delivered to ${m[1]} bees of the hive ✓`],
  [/^ELIMINARE TOTALMENTE l'utente "(.+)"\?\nSpariranno account, post, messaggi, gruppi e notifiche\. Irreversibile\.$/, m => `COMPLETELY DELETE the user "${m[1]}"?\nAccount, posts, messages, groups and notifications will disappear. Irreversible.`],
  [/^⭐ Complimenti, sei (.+?)!\n\n(.+)$/s, m => `⭐ Congratulations, you're ${m[1]}!\n\n${tr(m[2])}`],
  [/^🏅 Foto premiata! Tutte le api vedranno l(.*)$/s, m => `🏅 Awarded photo! All bees will see it${tr(m[1])}`],
  [/^· percepita (.+)$/, m => `· feels like ${m[1]}`],
  [/^· mare (.+)$/, m => `· sea ${m[1]}`],
  [/^· fino al (.+)$/, m => `· until ${m[1]}`],
  [/^· dalle (.+)$/, m => `· from ${m[1]}`],
  [/^dalle (.+)$/, m => `from ${m[1]}`],
  [/^dal (\d.+)$/, m => `from ${m[1]}`],
  [/^· (\d+) (foto|cieli|cielo|post|eventi|utenti|api|stelle|commenti|messaggi)$/, m => `· ${m[1]} ${unit(m[1], m[2])}`],
  [/^(Social|Cieli|Eventi|Persone|Gruppi|Luoghi) · (\d+)$/, m => `${DICT[m[1]] || m[1]} · ${m[2]}`],
  [/^(Temporale|Pioggia|Mareggiata|Neve|Nebbia|Vento forte) a (.+)$/, m => `${cond(m[1])} at ${m[2]}`],
  [/^sospesa fino al (.+)$/, m => `suspended until ${m[1]}`],
  [/^Benvenuto tra gli amministratori dell(.*)$/s, m => DICT["Benvenuto tra gli amministratori dell'alveare 👑\nTrovi l'Area riservata nel tuo Profilo."]],
  [/^Il link è valido per (.+)$/, m => `The link is valid for ${tr(m[1])}`],
  [/^Se l'email «?(.+?)»? è associata a un account Beeweat, riceverai un'email con un link sicuro per reimpostare la password\.$/, m => `If the email ${m[1]} is linked to a Beeweat account, you'll get an email with a secure link to reset the password.`],
  [/^(Valido fino a|Organizzato da|Fonte:|Modello:) (.+)$/, m => `${DICT[m[1]]} ${tr(m[2])}`],
  [new RegExp(`^(\\d{1,2}) (${MONTHS_RE})( \\d{4})?$`, "i"), m => `${m[1]} ${DICT[m[2].toLowerCase()]}${m[3] || ""}`],
  [new RegExp(`^(${MONTHS_RE})( \\d{4})?$`, "i"), m => `${DICT[m[1].toLowerCase()]}${m[2] || ""}`],
  [new RegExp(`^(dom|lun|mar|mer|gio|ven|sab)\\.? (\\d.*)$`), m => `${DICT[m[1]]} ${m[2]}`],
  [new RegExp(`^(${COND_RE}) (\\d.*)$`), m => `${cond(m[1])} ${m[2]}`],
  [/^Modello: (.+)$/, m => `Model: ${cond(m[1])}`],
  [/^Condizione prevalente: (.+)$/, m => `Prevailing condition: ${cond(m[1])}`],
  [/^(Es\.|es\.) (.+)$/, m => `E.g. ${m[2]}`],
].filter(r => r && r[0]);

// ─── TRADUZIONE DI UNA STRINGA ──────────────────────────────────────────────────────────────────
const cache = new Map();
const EMO = "[\\p{Extended_Pictographic}\\u{1F3FB}-\\u{1F3FF}\\u{FE0F}\\u{200D}\\u{20E3}\\u2600-\\u27BF★☆✓✗•—–·]";
const LEAD = new RegExp(`^((?:${EMO}|\\s)+)`, "u"), TRAIL = new RegExp(`((?:${EMO}|\\s|[!?.])+)$`, "u");
let depth = 0;

function trCore(t) {
  if (t === "" || /^[\d\s.,:%°'′″+\-–—·/()\[\]«»"“”]*$/.test(t)) return null;   // solo numeri/segni: resta
  if (Object.prototype.hasOwnProperty.call(DICT, t)) return DICT[t];
  for (const [re, fn] of RULES) { const m = t.match(re); if (m) { const r = fn(m); if (r != null) return r; } }
  // pezzi separati da " · " (es. "Worker Bee · 2 stelle", "Capri · 3 min fa · …")
  if (t.includes(" · ")) {
    const parts = t.split(" · ").map(p => trPiece(p)); if (parts.some((p, i) => p !== t.split(" · ")[i])) return parts.join(" · ");
  }
  if (t.includes("\n")) { const ls = t.split("\n").map(l => trPiece(l)); if (ls.some((l, i) => l !== t.split("\n")[i])) return ls.join("\n"); }
  // emoji o segni in testa/coda (es. "☀️ Sereno", "📍 Capri", "Beeweat 🐝 !")
  const lm = t.match(LEAD), tm = t.match(TRAIL);
  if ((lm && lm[1]) || (tm && tm[1])) {
    const a = lm ? lm[1] : "", z = tm ? tm[1] : "", mid = t.slice(a.length, t.length - z.length);
    if (mid && mid !== t) { const r = trCore(mid); if (r != null) return a + r + z; }
  }
  // "Testo: altro" e "Testo (altro)" → tradotti a pezzi
  const pm = t.match(/^([^(]+?) \((.+)\)$/); if (pm) { const a = trPiece(pm[1]), b = trPiece(pm[2]); if (a !== pm[1] || b !== pm[2]) return `${a} (${b})`; }
  const cm = t.match(/^(.+?): (.+)$/); if (cm) { const a = trPiece(cm[1]), b = trPiece(cm[2]); if (a !== cm[1] || b !== cm[2]) return `${a}: ${b}`; }
  // più frasi (". ") → ciascuna da sola
  if (/\. \S/.test(t)) { const ss = t.split(/(?<=\.) /).map(x => trPiece(x)); if (ss.some((x, i) => x !== t.split(/(?<=\.) /)[i])) return ss.join(" "); }
  return null;
}
function trPiece(p) { const m = p.match(/^(\s*)(.*?)(\s*)$/s); const r = trCore(m[2]); return r == null ? p : m[1] + r + m[3]; }

export function tr(s) {
  if (typeof s !== "string" || getLang() === "it") return s;
  if (cache.has(s)) return cache.get(s);
  let out = s;
  if (depth < 6) { depth++; try { out = trPiece(s); } catch (_) { out = s; } depth--; }
  if (cache.size < 5000) cache.set(s, out);
  return out;
}

// ─── IL TRADUTTORE SULLA PAGINA ─────────────────────────────────────────────────────────────────
const ATTRS = ["placeholder", "title", "aria-label", "alt"];
const seen = new WeakMap();   // nodo → ultimo testo inglese impostato (per non ritradurre e non girare in tondo)
const skip = el => { for (let e = el; e; e = e.parentElement) { const n = e.nodeName; if (n === "SCRIPT" || n === "STYLE" || n === "TEXTAREA" || e.getAttribute("data-notr") != null) return true; } return false; };
function fixText(n) {
  const v = n.nodeValue; if (!v || !v.trim() || seen.get(n) === v) return;
  if (skip(n.parentElement)) return;
  const t = tr(v); if (t !== v) { seen.set(n, t); n.nodeValue = t; } else seen.set(n, v);
}
function fixAttrs(el) {
  if (!el.getAttribute) return;
  for (const a of ATTRS) { const v = el.getAttribute(a); if (!v) continue; const t = tr(v); if (t !== v) el.setAttribute(a, t); }
}
function walk(root) {
  if (root.nodeType === 3) { fixText(root); return; }
  if (root.nodeType !== 1 && root.nodeType !== 11) return;
  if (root.nodeType === 1) { if (skip(root)) return; fixAttrs(root); }
  const w = document.createTreeWalker(root, 5);
  for (let n = w.nextNode(); n; n = w.nextNode()) { if (n.nodeType === 3) fixText(n); else fixAttrs(n); }
}
let installed = false;
export function installTranslator() {
  if (installed) return; installed = true;
  const lang = getLang();
  try { document.documentElement.lang = lang; } catch (_) {}
  if (lang === "it") return;
  // avvisi di sistema
  const _alert = window.alert.bind(window), _confirm = window.confirm.bind(window), _prompt = window.prompt.bind(window);
  window.alert = m => _alert(tr(String(m)));
  window.confirm = m => _confirm(tr(String(m)));
  window.prompt = (m, d) => _prompt(tr(String(m)), d);
  const start = () => {
    walk(document.body);
    const mo = new MutationObserver(ms => {
      for (const m of ms) {
        if (m.type === "characterData") fixText(m.target);
        else if (m.type === "attributes") fixAttrs(m.target);
        else m.addedNodes.forEach(walk);
      }
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  };
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
}
