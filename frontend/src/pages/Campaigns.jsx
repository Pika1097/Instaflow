import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import Skeleton from "../components/Skeleton";
import Toast from "../components/toast";

const defaultForm = {
  keyword: "",
  message: "",
  priority: 1,
  startHour: "",
  endHour: "",
  minWords: "",
};

function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: "", type: "info" }), 2600);
  };

  const loadCampaigns = async () => {
    const data = await apiRequest("/campaigns");
    if (data?.success) setCampaigns(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const data = await apiRequest("/campaigns");

      if (!mounted) return;

      if (data?.success) setCampaigns(data.data || []);
      setLoading(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm);
  };

  const getPayload = () => ({
    keyword: form.keyword.trim(),
    message: form.message.trim(),
    priority: Number(form.priority),
    start_hour: form.startHour === "" ? null : Number(form.startHour),
    end_hour: form.endHour === "" ? null : Number(form.endHour),
    min_words: form.minWords === "" ? 0 : Number(form.minWords),
  });

  const validateForm = () => {
    if (!form.keyword.trim() || !form.message.trim()) {
      showToast("Keyword and message are required", "error");
      return false;
    }

    if (form.keyword.trim().length < 2) {
      showToast("Keyword must be at least 2 characters", "error");
      return false;
    }

    if (form.message.trim().length < 3) {
      showToast("Message must be at least 3 characters", "error");
      return false;
    }

    const numericFields = [
      ["startHour", "Start hour"],
      ["endHour", "End hour"],
    ];

    for (const [key, label] of numericFields) {
      if (form[key] !== "" && (Number(form[key]) < 0 || Number(form[key]) > 23)) {
        showToast(`${label} must be between 0 and 23`, "error");
        return false;
      }
    }

    if (form.minWords !== "" && Number(form.minWords) < 0) {
      showToast("Minimum words cannot be negative", "error");
      return false;
    }

    return true;
  };

  const saveCampaign = async () => {
    if (!validateForm()) return;

    setSaving(true);

    const payload = getPayload();
    const data = editingId
      ? await apiRequest(`/campaign/${editingId}`, "PUT", payload)
      : await apiRequest("/campaign", "POST", payload);

    if (data?.success) {
      showToast(data.message || "Campaign saved", "success");
      resetForm();
      await loadCampaigns();
    } else {
      showToast(data?.message || "Could not save campaign", "error");
    }

    setSaving(false);
  };

  const startEditing = (campaign) => {
    const conditions = campaign.conditions || {};
    setEditingId(campaign._id);
    setForm({
      keyword: campaign.keyword || "",
      message: campaign.message || "",
      priority: campaign.priority || 1,
      startHour: conditions.start_hour ?? "",
      endHour: conditions.end_hour ?? "",
      minWords: conditions.min_words ?? "",
    });
  };

  const deleteCampaign = async (id) => {
    setDeletingId(id);
    const data = await apiRequest(`/campaign/${id}`, "DELETE");

    if (data?.success) {
      showToast("Campaign deleted", "success");
      await loadCampaigns();
    } else {
      showToast(data?.message || "Delete failed", "error");
    }

    setDeletingId(null);
  };

  const toggleCampaign = async (id) => {
    const data = await apiRequest(`/campaign/${id}/toggle`, "PUT");

    if (data?.success) {
      await loadCampaigns();
    } else {
      showToast(data?.message || "Toggle failed", "error");
    }
  };

  const testAutomation = async () => {
    if (!comment.trim()) {
      showToast("Comment cannot be empty", "error");
      return;
    }

    setTesting(true);
    const data = await apiRequest("/test-comment", "POST", { comment: comment.trim() });

    if (data?.success && data.data?.reply) {
      showToast(`DM reply: ${data.data.reply}`, "success");
    } else {
      showToast(data?.message || "No matching campaign", "info");
    }

    setTesting(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <Toast message={toast.message} type={toast.type} />

      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            Automation builder
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Campaigns
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            Build keyword triggers, set priority, limit when they run, and test the exact Instagram comments your audience leaves.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {campaigns.filter((campaign) => campaign.active !== false).length} active of {campaigns.length}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black">{editingId ? "Edit campaign" : "Create campaign"}</h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold dark:border-gray-800"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Keywords</span>
                <input
                  value={form.keyword}
                  onChange={(event) => updateField("keyword", event.target.value)}
                  placeholder="link, price:2, discount"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:focus:bg-gray-900"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300">DM reply</span>
                <textarea
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  placeholder="Thanks for commenting. I sent you the full details in DM."
                  rows="4"
                  className="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:focus:bg-gray-900"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Priority</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.priority}
                    onChange={(event) => updateField("priority", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Start</span>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={form.startHour}
                    onChange={(event) => updateField("startHour", event.target.value)}
                    placeholder="Any"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">End</span>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={form.endHour}
                    onChange={(event) => updateField("endHour", event.target.value)}
                    placeholder="Any"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Minimum words</span>
                <input
                  type="number"
                  min="0"
                  value={form.minWords}
                  onChange={(event) => updateField("minWords", event.target.value)}
                  placeholder="0"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950"
                />
              </label>

              <button
                type="button"
                onClick={saveCampaign}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-950"
              >
                <Icon name={editingId ? "edit" : "plus"} />
                {saving ? "Saving..." : editingId ? "Update campaign" : "Create campaign"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-black">Test comment</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Simulate the exact phrase a follower might write on a Reel.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Link please"
                className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950"
              />
              <button
                type="button"
                onClick={testAutomation}
                disabled={testing}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600 disabled:opacity-60"
              >
                <Icon name="play" />
                {testing ? "Testing..." : "Run test"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-5 text-xl font-black">Your campaigns</h2>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : campaigns.length === 0 ? (
            <EmptyState
              title="No campaigns yet"
              description="Create your first keyword automation and test it before connecting real Instagram workflows."
            />
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => {
                const conditions = campaign.conditions || {};

                return (
                  <div
                    key={campaign._id}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-emerald-200 hover:bg-white dark:border-gray-800 dark:bg-gray-950 dark:hover:border-emerald-900 dark:hover:bg-gray-900"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-lg font-black">{campaign.keyword}</h3>
                          <span className={`rounded-full px-3 py-1 text-xs font-black ${
                            campaign.active === false
                              ? "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}
                          >
                            {campaign.active === false ? "Paused" : "Active"}
                          </span>
                        </div>
                        <p className="mt-2 break-words text-sm leading-6 text-gray-600 dark:text-gray-400">
                          {campaign.message}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                          <span className="rounded-full bg-white px-3 py-1 dark:bg-gray-900">
                            Priority {campaign.priority}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 dark:bg-gray-900">
                            Hours {conditions.start_hour ?? "Any"}-{conditions.end_hour ?? "Any"}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 dark:bg-gray-900">
                            Min words {conditions.min_words ?? 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCampaign(campaign._id)}
                          className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-black transition hover:bg-white dark:border-gray-800 dark:hover:bg-gray-800"
                        >
                          {campaign.active === false ? "Activate" : "Pause"}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditing(campaign)}
                          className="grid h-9 w-9 place-items-center rounded-xl border border-gray-200 transition hover:bg-white dark:border-gray-800 dark:hover:bg-gray-800"
                          title="Edit campaign"
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCampaign(campaign._id)}
                          disabled={deletingId === campaign._id}
                          className="grid h-9 w-9 place-items-center rounded-xl bg-red-500 text-white transition hover:bg-red-600 disabled:opacity-60"
                          title="Delete campaign"
                        >
                          <Icon name="trash" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Campaigns;
