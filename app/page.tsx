"use client";

import { useMemo, useState } from "react";

type Member = {
  id: number;
  name: string;
  phone: string;
  balance: number;
  total: number;
  discount: number;
  color: string;
  initials: string;
};

type Transaction = {
  id: number;
  memberId: number;
  type: "消费" | "充值";
  title: string;
  date: string;
  amount: number;
  detail: string;
};

const initialMembers: Member[] = [
  { id: 1, name: "林小满", phone: "138****6214", balance: 16840, total: 20000, discount: 0.7, color: "coral", initials: "林" },
  { id: 2, name: "周宁", phone: "136****8052", balance: 8620, total: 10000, discount: 0.8, color: "blue", initials: "周" },
  { id: 3, name: "方圆圆", phone: "159****3371", balance: 4210, total: 5000, discount: 0.85, color: "purple", initials: "方" },
  { id: 4, name: "陈默", phone: "186****1198", balance: 1200, total: 2000, discount: 0.9, color: "green", initials: "陈" },
];

const initialTransactions: Transaction[] = [
  { id: 1, memberId: 1, type: "消费", title: "鞋类产品拍摄", date: "今天 14:32", amount: -120, detail: "原价 ¥171.43 · 7折会员价" },
  { id: 2, memberId: 1, type: "消费", title: "静物精修 6张", date: "昨天 16:08", amount: -420, detail: "原价 ¥600.00 · 7折会员价" },
  { id: 3, memberId: 1, type: "充值", title: "账户充值", date: "03月18日 10:24", amount: 20000, detail: "微信支付 · 充值到账" },
  { id: 4, memberId: 1, type: "消费", title: "服装棚拍半天", date: "03月12日 09:15", amount: -2620, detail: "原价 ¥3,742.86 · 7折会员价" },
  { id: 5, memberId: 1, type: "消费", title: "产品白底图 10张", date: "03月05日 18:42", amount: -700, detail: "原价 ¥1,000.00 · 7折会员价" },
];

const money = (value: number) => `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;

export default function Home() {
  const [members, setMembers] = useState(initialMembers);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedId, setSelectedId] = useState(1);
  const [query, setQuery] = useState("");
  const [service, setService] = useState("鞋类产品拍摄");
  const [price, setPrice] = useState("120");
  const [mode, setMode] = useState<"消费" | "充值">("消费");
  const [toast, setToast] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditMember, setShowEditMember] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [services, setServices] = useState(["鞋类产品拍摄", "静物精修 6张", "服装棚拍半天", "产品白底图 10张"]);
  const [customService, setCustomService] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDiscount, setNewDiscount] = useState("7");
  const [newBalance, setNewBalance] = useState("0");

  const selected = members.find((member) => member.id === selectedId) ?? members[0];
  const visibleMembers = members.filter((member) => `${member.name}${member.phone}`.includes(query));
  const memberTransactions = transactions.filter((item) => item.memberId === selected.id);
  const originalPrice = mode === "消费" ? Number(price || 0) / selected.discount : Number(price || 0);
  const discountedPrice = mode === "消费" ? Number(price || 0) : Number(price || 0) * selected.discount;

  const stats = useMemo(() => ({
    balance: members.reduce((sum, member) => sum + member.balance, 0),
    count: members.length,
    consumed: transactions.filter((item) => item.type === "消费").reduce((sum, item) => sum + Math.abs(item.amount), 0),
  }), [members, transactions]);

  function openEditMember() {
    setEditName(selected.name);
    setEditPhone(selected.phone.includes("****") ? "" : selected.phone);
    setShowEditMember(true);
  }

  function saveMember() {
    const name = editName.trim();
    if (!name) return;
    setMembers(members.map((member) => member.id === selected.id ? { ...member, name, phone: editPhone.trim() || "未填写手机号", initials: name.slice(0, 1) } : member));
    setShowEditMember(false);
    setToast("会员资料已更新");
    setTimeout(() => setToast(""), 2600);
  }

  function addCustomService() {
    const item = customService.trim();
    if (!item || services.includes(item)) return;
    setServices([...services, item]);
    setService(item);
    setCustomService("");
    setToast("服务项目已添加");
    setTimeout(() => setToast(""), 2600);
  }

  function addMember() {
    const name = newName.trim();
    if (!name) return;
    const balance = Number(newBalance) || 0;
    const discount = Math.min(1, Math.max(0.1, Number(newDiscount || 7) / 10));
    const id = Date.now();
    const member: Member = { id, name, phone: newPhone.trim() || "未填写手机号", balance, total: balance, discount, color: "coral", initials: name.slice(0, 1) };
    setMembers([...members, member]);
    setSelectedId(id);
    if (balance > 0) setTransactions([{ id, memberId: id, type: "充值", title: "账户充值", date: "刚刚", amount: balance, detail: "新会员开户 · 充值到账" }, ...transactions]);
    setNewName(""); setNewPhone(""); setNewDiscount("7"); setNewBalance("0"); setShowAddMember(false);
    setToast(`已添加会员：${name}`); setTimeout(() => setToast(""), 2600);
  }

  function submitRecord() {
    const amount = Number(price);
    if (!amount || amount <= 0) return;
    const record: Transaction = {
      id: Date.now(), memberId: selected.id, type: mode, title: mode === "消费" ? service : "账户充值",
      date: "刚刚", amount: mode === "消费" ? -amount : amount,
      detail: mode === "消费" ? `原价 ${money(originalPrice)} · ${selected.discount * 10}折会员价` : "前台录入 · 充值到账",
    };
    setTransactions([record, ...transactions]);
    setMembers(members.map((member) => member.id === selected.id ? { ...member, balance: member.balance + record.amount, total: mode === "充值" ? member.total + amount : member.total } : member));
    setToast(mode === "消费" ? `已扣款 ${money(amount)}` : `已充值 ${money(amount)}`);
    setPrice(mode === "消费" ? "120" : "2000");
    setTimeout(() => setToast(""), 2600);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">◒</div><div><strong>定格摄影</strong><span>会员管理中心</span></div></div>
        <nav><a className="active"><span>▦</span>工作台</a><a><span>♙</span>会员管理</a><a><span>▤</span>消费记录</a><a><span>⌁</span>价格与折扣</a></nav>
        <div className="side-bottom"><a><span>⚙</span>设置</a><div className="operator"><div className="mini-avatar">李</div><div><b>李晓燕</b><small>管理员</small></div><span>···</span></div></div>
      </aside>

      <section className="content">
        <header className="topbar"><div><p className="eyebrow">SATURDAY, MARCH 22, 2025</p><h1>早上好，李晓燕 <span>✦</span></h1><p className="subtext">今天也要为每一位客人留下好看的影像。</p></div><button className="primary-btn" onClick={() => { setMode("消费"); document.getElementById("record-form")?.scrollIntoView({ behavior: "smooth" }); }}>＋ 新增消费记录</button></header>

        <div className="stats-grid"><div className="stat-card"><div className="stat-icon peach">¥</div><div><span>会员总余额</span><strong>{money(stats.balance)}</strong><small>较上月 <em>+8.6%</em></small></div></div><div className="stat-card"><div className="stat-icon lavender">♙</div><div><span>会员总数</span><strong>{stats.count}<i> 位</i></strong><small>本月新增 <em>+2 位</em></small></div></div><div className="stat-card"><div className="stat-icon mint">↗</div><div><span>本月消费额</span><strong>{money(stats.consumed)}</strong><small>共 {transactions.filter((t) => t.type === "消费").length} 笔消费</small></div></div></div>

        <div className="workspace-grid">
          <section className="panel members-panel"><div className="panel-head"><div><h2>我的会员</h2><p>选择会员查看账户详情</p></div><button className="add-member-btn" onClick={() => setShowAddMember(true)}>＋ 添加会员</button></div><div className="search"><span>⌕</span><input placeholder="搜索姓名或手机号" value={query} onChange={(e) => setQuery(e.target.value)} /></div><div className="member-list">{visibleMembers.map((member) => <button key={member.id} className={`member-row ${selected.id === member.id ? "selected" : ""}`} onClick={() => setSelectedId(member.id)}><div className={`avatar ${member.color}`}>{member.initials}</div><div className="member-copy"><b>{member.name}</b><span>{member.phone}</span></div><div className="member-balance"><b>{money(member.balance)}</b><span>余额</span></div><span className="chevron">›</span></button>)}</div><button className="secondary-btn full">查看全部会员 <span>→</span></button></section>

          <section className="panel account-panel"><div className="panel-head"><div><h2>{selected.name}的账户</h2><p>最后更新：刚刚</p></div><div className="account-actions"><span className="status-pill">● 正常</span><button className="edit-link" onClick={openEditMember}>编辑资料</button></div></div><div className="balance-box"><span>当前可用余额</span><strong>{money(selected.balance)}</strong><div className="balance-meta"><span>累计充值 <b>{money(selected.total)}</b></span><span>会员折扣 <b className="discount">{selected.discount * 10}折</b></span></div><div className="progress"><i style={{ width: `${Math.min(100, selected.balance / selected.total * 100)}%` }} /></div><small>已使用 {Math.round((1 - selected.balance / selected.total) * 100)}% 充值金额</small></div><div className="history-head"><h3>账户明细</h3><button className="filter-btn">近30天⌄</button></div><div className="transactions">{memberTransactions.map((item) => <div className="transaction" key={item.id}><div className={`transaction-icon ${item.type === "充值" ? "recharge" : "consume"}`}>{item.type === "充值" ? "＋" : "▣"}</div><div className="transaction-copy"><b>{item.title}</b><span>{item.date} · {item.detail}</span></div><strong className={item.amount > 0 ? "positive" : ""}>{item.amount > 0 ? "+" : "−"}{money(Math.abs(item.amount))}</strong></div>)}</div><button className="secondary-btn full">查看完整明细 <span>→</span></button></section>

          <section className="panel record-panel" id="record-form"><div className="panel-head"><div><h2>快速记一笔</h2><p>消费或充值即时更新账户</p></div><div className="bolt">ϟ</div></div><div className="mode-switch"><button className={mode === "消费" ? "on" : ""} onClick={() => setMode("消费")}>消费扣款</button><button className={mode === "充值" ? "on" : ""} onClick={() => setMode("充值")}>账户充值</button></div>{mode === "消费" ? <><label>服务项目</label><select value={service} onChange={(e) => setService(e.target.value)}>{services.map((item) => <option key={item}>{item}</option>)}</select><div className="custom-service"><input placeholder="输入新的服务项目" value={customService} onChange={(e) => setCustomService(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustomService()} /><button onClick={addCustomService}>添加项目</button></div><div className="field-label"><label>会员价（实扣金额）</label><span>原价自动折算</span></div><div className="price-input"><span>¥</span><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div><div className="calc"><div><span>原价</span><b>{money(originalPrice)}</b></div><div><span>会员折扣</span><b className="discount">{selected.discount * 10}折</b></div><div><span>本次实扣</span><b className="total-price">{money(discountedPrice)}</b></div></div></> : <><label>充值金额</label><div className="price-input large"><span>¥</span><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div><div className="recharge-note">充值后余额将变为 <b>{money(selected.balance + Number(price || 0))}</b></div></>}<button className="submit-btn" onClick={submitRecord}>{mode === "消费" ? "确认扣款" : "确认充值"} <span>→</span></button><p className="tip">⌁ 记录后会员余额会立即更新</p></section>
        </div>
        <footer><span>定格摄影 · 会员管理中心</span><span>数据仅供内部使用</span></footer>
      </section>
      {toast && <div className="toast">✓ {toast}</div>}
      {showEditMember && <div className="modal-backdrop" onClick={() => setShowEditMember(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><h2>编辑会员资料</h2><p>修改 {selected.name} 的基本信息</p></div><button className="close-btn" onClick={() => setShowEditMember(false)}>×</button></div><label>会员姓名</label><input className="modal-input" autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} /><label>手机号</label><input className="modal-input" placeholder="请输入手机号" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} /><button className="submit-btn" onClick={saveMember}>保存资料 <span>→</span></button></div></div>}
      {showAddMember && <div className="modal-backdrop" onClick={() => setShowAddMember(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><h2>添加新会员</h2><p>建立会员账户并设置专属折扣</p></div><button className="close-btn" onClick={() => setShowAddMember(false)}>×</button></div><label>会员姓名</label><input className="modal-input" autoFocus placeholder="请输入姓名" value={newName} onChange={(e) => setNewName(e.target.value)} /><label>手机号（选填）</label><input className="modal-input" placeholder="请输入手机号" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} /><div className="modal-two"><div><label>会员折扣</label><div className="suffix-input"><input type="number" min="1" max="10" step="0.5" value={newDiscount} onChange={(e) => setNewDiscount(e.target.value)} /><span>折</span></div></div><div><label>初始充值</label><div className="suffix-input"><span>¥</span><input type="number" min="0" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} /></div></div></div><button className="submit-btn" onClick={addMember}>确认添加 <span>→</span></button></div></div>}
    </main>
  );
}
