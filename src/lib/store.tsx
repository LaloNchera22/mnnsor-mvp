"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { DocType } from "@/lib/agents";
import { getAgent } from "@/lib/agents";
import type { Photo } from "@/lib/generate";
import { folio, uid } from "@/lib/utils";

/*
 * Store de demostración de mnnsor.
 *
 * Fase 1 no tiene backend conectado (Supabase llega en Fase 2). Para que la
 * UI/UX se sienta como un producto real, este store mantiene el estado en el
 * navegador (localStorage) con una capa mínima de "acciones". Cuando exista
 * backend, cada acción aquí se reemplaza por una Server Action / query a
 * Supabase sin tocar los componentes.
 */

export type PlanId = "free" | "pro" | "empresa";
export type DocStatus = "borrador" | "generado" | "firmado";

export interface Obra {
  id: string;
  nombre: string;
  cliente: string;
  ubicacion: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  folio: string;
  docType: DocType;
  titulo: string;
  obraId: string;
  status: DocStatus;
  createdAt: string;
  updatedAt: string;
  notasCrudas: string;
  contenido: string; // markdown-ish del documento formal generado
  /** JSON de StructuredDoc — habilita vista papel, edición inline y procedencia. */
  estructura?: string;
  /** Fotos del reporte fotográfico (demo: data URLs). */
  fotos?: Photo[];
}

export interface Org {
  nombre: string;
  plan: PlanId;
}

interface State {
  org: Org;
  obras: Obra[];
  documents: DocumentItem[];
  currentObraId: string | null;
  /** false en el primer uso: se muestra el onboarding guiado, no el dashboard. */
  onboarded: boolean;
}

export const PLAN_LIMITS: Record<PlanId, number> = {
  free: 15,
  pro: 300,
  empresa: Infinity,
};

export const PLAN_LABEL: Record<PlanId, string> = {
  free: "Free",
  pro: "Pro",
  empresa: "Empresa",
};

const STORAGE_KEY = "mnnsor-store-v2";

/**
 * Estado del primer uso: sin obras ni documentos de ejemplo. El dashboard
 * detecta `onboarded: false` y abre el onboarding guiado (crear la primera
 * obra y generar el primer documento), en vez de caer en datos semilla.
 */
function fresh(): State {
  return {
    org: { nombre: "", plan: "free" },
    obras: [],
    documents: [],
    currentObraId: null,
    onboarded: false,
  };
}

function seed(): State {
  const now = Date.now();
  const iso = (minsAgo: number) => new Date(now - minsAgo * 60000).toISOString();

  const obraA: Obra = {
    id: "obra_resid_altozano",
    nombre: "Residencial Altozano — Torre B",
    cliente: "Constructora del Bajío",
    ubicacion: "Querétaro, Qro.",
    createdAt: iso(60 * 24 * 12),
  };
  const obraB: Obra = {
    id: "obra_nave_ind",
    nombre: "Nave industrial El Marqués",
    cliente: "Grupo Logístico QRO",
    ubicacion: "El Marqués, Qro.",
    createdAt: iso(60 * 24 * 5),
  };

  const docs: DocumentItem[] = [
    {
      id: uid("doc_"),
      folio: folio("BIT", 14),
      docType: "bitacora",
      titulo: "Bitácora — colado de losa nivel 3",
      obraId: obraA.id,
      status: "firmado",
      createdAt: iso(180),
      updatedAt: iso(120),
      notasCrudas:
        "clima despejado 28°, 14 trabajadores, colado losa n3 eje C-F, 42 m3 concreto f'c 250, vibrado ok, se retrasó bomba 40 min",
      contenido: "",
    },
    {
      id: uid("doc_"),
      folio: folio("AST", 9),
      docType: "ast",
      titulo: "AST — trabajos en altura fachada norte",
      obraId: obraA.id,
      status: "generado",
      createdAt: iso(60 * 20),
      updatedAt: iso(60 * 20),
      notasCrudas:
        "andamio fachada norte, riesgo caída distinto nivel, arnés doble línea, línea de vida, delimitar área",
      contenido: "",
    },
    {
      id: uid("doc_"),
      folio: folio("MIN", 3),
      docType: "minuta",
      titulo: "Minuta — coordinación semanal MEP",
      obraId: obraB.id,
      status: "generado",
      createdAt: iso(60 * 48),
      updatedAt: iso(60 * 47),
      notasCrudas:
        "asistieron residente, instalador hidrosanitario, eléctrico. acuerdo: liberar registros antes viernes. pendiente planos as-built eléctrico responsable Juan 22 ago",
      contenido: "",
    },
    {
      id: uid("doc_"),
      folio: folio("OC", 21),
      docType: "orden_compra",
      titulo: "Orden de compra — acero de refuerzo",
      obraId: obraB.id,
      status: "borrador",
      createdAt: iso(60 * 70),
      updatedAt: iso(60 * 70),
      notasCrudas: "2 ton varilla 3/8, 1.5 ton varilla 1/2, alambre recocido 50 kg",
      contenido: "",
    },
  ];

  return {
    org: { nombre: "Constructora del Bajío", plan: "free" },
    obras: [obraA, obraB],
    documents: docs,
    currentObraId: obraA.id,
    onboarded: true,
  };
}

function load(): State {
  if (typeof window === "undefined") return fresh();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh();
    const parsed = JSON.parse(raw) as State;
    if (!parsed.obras || !parsed.documents) return fresh();
    return { ...fresh(), ...parsed };
  } catch {
    return fresh();
  }
}

interface StoreContextValue extends State {
  ready: boolean;
  currentObra: Obra | null;
  usedThisMonth: number;
  planLimit: number;
  setCurrentObra: (id: string) => void;
  addObra: (input: Omit<Obra, "id" | "createdAt">) => Obra;
  createDocument: (input: {
    docType: DocType;
    obraId: string;
    notasCrudas: string;
    contenido: string;
    titulo?: string;
    estructura?: string;
    fotos?: Photo[];
  }) => DocumentItem;
  updateDocument: (id: string, patch: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;
  setPlan: (plan: PlanId) => void;
  setOrgName: (nombre: string) => void;
  /** Marca el onboarding como completado (primer documento generado). */
  completeOnboarding: () => void;
  /** Carga las obras y documentos de ejemplo (explorar la demo). */
  loadDemo: () => void;
  reset: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(fresh);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* almacenamiento lleno o no disponible: la demo sigue en memoria */
    }
  }, [state, ready]);

  const setCurrentObra = useCallback((id: string) => {
    setState((s) => ({ ...s, currentObraId: id }));
  }, []);

  const addObra = useCallback((input: Omit<Obra, "id" | "createdAt">) => {
    const obra: Obra = {
      ...input,
      id: uid("obra_"),
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, obras: [obra, ...s.obras], currentObraId: obra.id }));
    return obra;
  }, []);

  const createDocument = useCallback<StoreContextValue["createDocument"]>(
    ({ docType, obraId, notasCrudas, contenido, titulo, estructura, fotos }) => {
      const agent = getAgent(docType);
      const seq = Math.floor(Math.random() * 900) + 10;
      const now = new Date().toISOString();
      const doc: DocumentItem = {
        id: uid("doc_"),
        folio: folio(agent?.slug ?? "DOC", seq),
        docType,
        titulo: titulo || `${agent?.nombre ?? "Documento"}`,
        obraId,
        status: "generado",
        createdAt: now,
        updatedAt: now,
        notasCrudas,
        contenido,
        estructura,
        fotos,
      };
      // Generar el primer documento cierra el onboarding.
      setState((s) => ({
        ...s,
        onboarded: true,
        documents: [doc, ...s.documents],
      }));
      return doc;
    },
    [],
  );

  const updateDocument = useCallback((id: string, patch: Partial<DocumentItem>) => {
    setState((s) => ({
      ...s,
      documents: s.documents.map((d) =>
        d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d,
      ),
    }));
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setState((s) => ({ ...s, documents: s.documents.filter((d) => d.id !== id) }));
  }, []);

  const setPlan = useCallback((plan: PlanId) => {
    setState((s) => ({ ...s, org: { ...s.org, plan } }));
  }, []);

  const setOrgName = useCallback((nombre: string) => {
    setState((s) => ({ ...s, org: { ...s.org, nombre } }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((s) => ({ ...s, onboarded: true }));
  }, []);

  const loadDemo = useCallback(() => setState(seed()), []);

  const reset = useCallback(() => setState(seed()), []);

  const currentObra = useMemo(
    () => state.obras.find((o) => o.id === state.currentObraId) ?? state.obras[0] ?? null,
    [state.obras, state.currentObraId],
  );

  const usedThisMonth = useMemo(() => {
    const d = new Date();
    return state.documents.filter((doc) => {
      const c = new Date(doc.createdAt);
      return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
    }).length;
  }, [state.documents]);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      ready,
      currentObra,
      usedThisMonth,
      planLimit: PLAN_LIMITS[state.org.plan],
      setCurrentObra,
      addObra,
      createDocument,
      updateDocument,
      deleteDocument,
      setPlan,
      setOrgName,
      completeOnboarding,
      loadDemo,
      reset,
    }),
    [
      state,
      ready,
      currentObra,
      usedThisMonth,
      setCurrentObra,
      addObra,
      createDocument,
      updateDocument,
      deleteDocument,
      setPlan,
      setOrgName,
      completeOnboarding,
      loadDemo,
      reset,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de <StoreProvider>");
  return ctx;
}
