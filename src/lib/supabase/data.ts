import { supabase } from "./client";
import type { AppState, MovementType, PlanId, Role } from "@/types";

function mapPlan(dbPlan: string): PlanId {
  const map: Record<string, PlanId> = {
    gratuito: "gratuito",
    free: "gratuito",
    essencial: "essencial",
    profissional: "profissional",
    empresarial: "empresarial",
  };
  return map[dbPlan] ?? "gratuito";
}

export async function loadCompanyState(
  userId: string
): Promise<{ state?: AppState; error?: string }> {
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("id, name, email, created_at")
    .eq("id", userId)
    .single();

  if (pErr || !profile) return { error: "Perfil não encontrado." };

  const { data: membership, error: mErr } = await supabase
    .from("members")
    .select("id, company_id, role")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (mErr || !membership) return { error: "Nenhuma empresa vinculada à conta." };

  const companyId = membership.company_id as string;
  const role = membership.role as Role;

  const { data: company, error: cErr } = await supabase
    .from("companies")
    .select("id, name, segment, city, state, plan, created_at")
    .eq("id", companyId)
    .single();

  if (cErr || !company) return { error: "Empresa não encontrada." };

  const [productsRes, movementsRes, categoriesRes, alertsRes, auditRes, membersRes] =
    await Promise.all([
      supabase.from("products").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
      supabase.from("movements").select("*").eq("company_id", companyId).order("created_at", { ascending: false }).limit(500),
      supabase.from("categories").select("name").eq("company_id", companyId).order("name"),
      supabase.from("alerts").select("*").eq("company_id", companyId).order("created_at", { ascending: false }).limit(100),
      supabase.from("audit_logs").select("*").eq("company_id", companyId).order("created_at", { ascending: false }).limit(200),
      supabase.from("members").select("id, user_id, role, created_at").eq("company_id", companyId),
    ]);

  if (productsRes.error) return { error: productsRes.error.message };
  if (movementsRes.error) return { error: movementsRes.error.message };
  if (categoriesRes.error) return { error: categoriesRes.error.message };
  if (alertsRes.error) return { error: alertsRes.error.message };
  if (auditRes.error) return { error: auditRes.error.message };

  const memberUserIds = (membersRes.data ?? []).map((m: any) => m.user_id);
  let profilesData: any[] = [];
  if (memberUserIds.length > 0) {
    const { data: pd } = await supabase
      .from("profiles")
      .select("id, name, email, created_at")
      .in("id", memberUserIds);
    profilesData = pd ?? [];
  }

  const profileById = new Map(profilesData.map((p: any) => [p.id, p]));

  const appState: AppState = {
    version: 1,
    users: (membersRes.data ?? []).map((m: any) => {
      const p = profileById.get(m.user_id) as any;
      return {
        id: m.user_id,
        name: p?.name ?? "Usuário",
        email: p?.email ?? "",
        role: m.role as Role,
        companyId,
        createdAt: p?.created_at ?? m.created_at,
        lastLoginAt: new Date().toISOString(),
        passwordSalt: "",
        passwordHash: "",
      };
    }),
    companies: [{
      id: company.id,
      name: company.name,
      segment: company.segment,
      city: company.city ?? "",
      state: company.state ?? "",
      plan: mapPlan(company.plan),
      createdAt: company.created_at,
    }],
    products: (productsRes.data ?? []).map((p: any) => ({
      id: p.id,
      companyId: p.company_id,
      name: p.name,
      sku: p.sku ?? "",
      category: p.category ?? "Geral",
      color: p.color ?? "",
      size: p.size ?? "",
      barcode: p.barcode ?? "",
      price: Number(p.price),
      cost: Number(p.cost),
      qty: p.qty,
      minQty: p.min_qty,
      notes: p.notes ?? "",
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    })),
    movements: (movementsRes.data ?? []).map((m: any) => ({
      id: m.id,
      companyId: m.company_id,
      productId: m.product_id,
      productName: m.product_name ?? "",
      type: m.type,
      qty: m.qty,
      resultingQty: m.resulting_qty,
      note: m.note ?? "",
      userId: m.user_id,
      userName: m.user_name ?? "",
      createdAt: m.created_at,
    })),
    notifications: (alertsRes.data ?? []).map((a: any) => ({
      id: a.id,
      companyId: a.company_id,
      title: a.title,
      message: a.message ?? "",
      kind: a.kind ?? "info",
      productId: a.product_id,
      read: a.read,
      createdAt: a.created_at,
    })),
    audit: (auditRes.data ?? []).map((a: any) => ({
      id: a.id,
      companyId: a.company_id,
      userId: a.user_id,
      userName: a.user_name ?? "",
      action: a.action,
      details: a.details ?? "",
      createdAt: a.created_at,
    })),
    categories: {
      [companyId]: (categoriesRes.data ?? []).map((c: any) => c.name),
    },
    sessionUserId: userId,
  };

  return { state: appState };
}

export async function createProduct(input: {
  companyId: string;
  userId: string;
  userName: string;
  name: string;
  sku: string;
  category: string;
  color: string;
  size: string;
  barcode: string;
  price: number;
  cost: number;
  qty: number;
  minQty: number;
  notes: string;
}) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      company_id: input.companyId,
      name: input.name,
      sku: input.sku,
      category: input.category,
      color: input.color,
      size: input.size,
      barcode: input.barcode,
      price: input.price,
      cost: input.cost,
      qty: input.qty ?? 0,
      min_qty: input.minQty,
      notes: input.notes,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  if (input.qty > 0) {
    await supabase.from("movements").insert({
      company_id: input.companyId,
      product_id: data.id,
      user_id: input.userId,
      type: "entrada",
      qty: input.qty,
      resulting_qty: input.qty,
      note: "Saldo inicial no cadastro",
      product_name: data.name,
      user_name: input.userName,
    });
  }

  if (input.category) {
    await supabase
      .from("categories")
      .upsert(
        { company_id: input.companyId, name: input.category },
        { onConflict: "company_id,name", ignoreDuplicates: true }
      );
  }

  return { data };
}

export async function updateProduct(productId: string, input: {
  name: string;
  sku: string;
  category: string;
  color: string;
  size: string;
  barcode: string;
  price: number;
  cost: number;
  minQty: number;
  notes: string;
}) {
  const { error } = await supabase
    .from("products")
    .update({
      name: input.name,
      sku: input.sku,
      category: input.category,
      color: input.color,
      size: input.size,
      barcode: input.barcode,
      price: input.price,
      cost: input.cost,
      min_qty: input.minQty,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) return { error: error.message };
  return {};
}

export async function removeProduct(productId: string) {
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { error: error.message };
  return {};
}

export async function createMovement(input: {
  companyId: string;
  productId: string;
  userId: string;
  userName: string;
  productName: string;
  type: MovementType;
  qty: number;
  resultingQty: number;
  note: string;
}) {
  const { error: mvErr } = await supabase.from("movements").insert({
    company_id: input.companyId,
    product_id: input.productId,
    user_id: input.userId,
    type: input.type,
    qty: input.qty,
    resulting_qty: input.resultingQty,
    note: input.note,
    product_name: input.productName,
    user_name: input.userName,
  });
  if (mvErr) return { error: mvErr.message };

  const { error: upErr } = await supabase
    .from("products")
    .update({ qty: input.resultingQty, updated_at: new Date().toISOString() })
    .eq("id", input.productId);
  if (upErr) return { error: upErr.message };

  return {};
}

export async function updateCompanyData(
  companyId: string,
  patch: { name?: string; segment?: string; city?: string; state?: string }
) {
  const { error } = await supabase.from("companies").update(patch).eq("id", companyId);
  if (error) return { error: error.message };
  return {};
}

export async function addCategoryDb(companyId: string, name: string) {
  const { error } = await supabase
    .from("categories")
    .insert({ company_id: companyId, name });
  if (error) return { error: error.message };
  return {};
}

export async function updateUserProfile(userId: string, name: string) {
  const { error } = await supabase.from("profiles").update({ name }).eq("id", userId);
  if (error) return { error: error.message };
  return {};
}

export async function updateMemberRole(memberId: string, role: Role) {
  const { error } = await supabase.from("members").update({ role }).eq("id", memberId);
  if (error) return { error: error.message };
  return {};
}

export async function markAlertReadDb(alertId: string) {
  await supabase.from("alerts").update({ read: true }).eq("id", alertId);
}

export async function markAllAlertsReadDb(companyId: string) {
  await supabase
    .from("alerts")
    .update({ read: true })
    .eq("company_id", companyId)
    .eq("read", false);
}

export async function changePlanDb(companyId: string, plan: string) {
  const { error } = await supabase
    .from("companies")
    .update({ plan })
    .eq("id", companyId);
  if (error) return { error: error.message };
  return {};
}

export async function removeMemberDb(userId: string) {
  // Em vez de procurar pelo ID da linha da tabela members, 
  // procuramos pelo user_id (que é o ID que o frontend tem em mãos)
  const { error } = await supabase.from("members").delete().eq("user_id", userId);
  
  if (error) {
    console.error("Erro ao remover membro:", error);
    return { error: error.message };
  }
  return {};
}