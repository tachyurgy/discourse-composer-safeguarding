import { apiInitializer } from "discourse/lib/api";
import ComposerSafeguardingModal from "../components/composer-safeguarding-modal";
import { findMatches, parsePhrases, parseResources } from "../lib/matcher";

const STORAGE_KEY = "composer-safeguarding:last-shown";

function shownRecently() {
  const minutes = Number(settings.cooldown_minutes) || 0;
  if (minutes <= 0) {
    return false;
  }
  try {
    const last = Number(window.localStorage.getItem(STORAGE_KEY));
    return last > 0 && Date.now() - last < minutes * 60 * 1000;
  } catch {
    return false;
  }
}

function rememberShown() {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // private mode / storage disabled: the notice simply shows again next time
  }
}

// Does this draft fall inside the configured scope (categories, PMs)?
function inScope(composer) {
  if (composer.privateMessage) {
    return settings.check_personal_messages;
  }
  const scoped = String(settings.scope_categories || "")
    .split("|")
    .map((id) => Number(id))
    .filter((id) => id > 0);
  if (scoped.length === 0) {
    return true;
  }
  return scoped.includes(Number(composer.categoryId));
}

function exempt(user) {
  if (!user) {
    return false;
  }
  if (user.staff) {
    return true;
  }
  return Number(user.trust_level) >= Number(settings.min_trust_level_exempt);
}

export default apiInitializer((api) => {
  const modal = api.container.lookup("service:modal");
  const currentUser = api.getCurrentUser();

  api.composerBeforeSave(function () {
    // `this` is the Composer model: reply is the draft body, title the topic title.
    const composer = this;
    if (exempt(currentUser) || !inScope(composer) || shownRecently()) {
      return Promise.resolve();
    }
    const phrases = parsePhrases(settings.trigger_phrases);
    const text = [composer.title, composer.reply].filter(Boolean).join("\n");
    const matches = findMatches(text, phrases, { wholeWords: settings.match_whole_words });
    if (matches.length === 0) {
      return Promise.resolve();
    }

    rememberShown();
    return modal
      .show(ComposerSafeguardingModal, {
        model: {
          title: settings.notice_title,
          body: settings.notice_body,
          resources: parseResources(settings.resources),
          allowPostAnyway: settings.allow_post_anyway,
          postAnywayLabel: settings.post_anyway_label,
          goBackLabel: settings.go_back_label,
        },
      })
      .then((result) => {
        if (result?.proceed) {
          return; // resolve: the composer goes on to save
        }
        // Rejecting cancels the save and leaves the draft open, exactly as if the member had
        // never pressed Reply. The composer swallows the rejection quietly.
        throw new Error("composer-safeguarding: member chose to go back to the draft");
      });
  });
});
