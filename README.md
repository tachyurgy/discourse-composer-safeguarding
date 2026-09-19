# Composer Safeguarding Notice

A Discourse theme component for communities whose members may be in crisis. When a draft post
or message contains a phrase you configure ("I want to die", "self harm", …), the member sees a
calm notice with support resources **before** the post goes up. They can go back to the draft or
post anyway. Nothing is blocked, nothing is logged, and nothing leaves the browser.

Built for health, bereavement, addiction-recovery and peer-support forums, where the people who
most need a helpline number are the ones least likely to go looking for it.

## How it works

- Hooks the composer's *before save* step (`api.composerBeforeSave`). The check runs only at the
  moment the member presses Reply / Create Topic, on the title and body of the draft.
- Matching is a case-insensitive phrase list, whole-word by default so `die` does not fire on
  `diet`. Plain text only: no regex to get wrong.
- The notice is a standard Discourse modal: your title, your body text, a list of resource
  buttons that open in a new tab, and *Go back to my post* / *Post anyway*.
- **Privacy:** the draft is inspected in the member's browser and is not sent to any server,
  not even your own. The only thing stored is a timestamp in `localStorage` so the same person
  is not shown the notice again for `cooldown_minutes`. There is no record of who triggered it.
  That makes it usable on forums that handle health data under UK GDPR without a DPIA for the
  component itself.
- Staff never see it. Members at or above `min_trust_level_exempt` (default TL4) never see it.
- Optional scoping to specific categories and to personal messages.

## Settings

| setting | default | what it does |
|---|---|---|
| `trigger_phrases` | a short UK-oriented list | Phrases that open the notice. One per line. |
| `match_whole_words` | on | Only match a phrase standing on its own. |
| `notice_title` | *Before you post: you are not alone* | Heading. |
| `notice_body` | supportive paragraph | Body text; line breaks kept. |
| `resources` | Samaritans, Shout, findahelpline.com | One per line: label followed by the link. |
| `allow_post_anyway` | on | Show *Post anyway*. Off means the member must return to the draft. |
| `post_anyway_label` / `go_back_label` | | Button text. |
| `scope_categories` | all | Limit to these categories. |
| `check_personal_messages` | on | Also check PM drafts. |
| `cooldown_minutes` | 60 | Suppress repeat notices in this browser. 0 = every time. |
| `min_trust_level_exempt` | 4 | Members at or above this trust level are exempt. |

Change the default resources to the services that cover your members' countries. The defaults
are UK/ROI because the component was written for a UK cancer-support forum's requirements.

## Install

Admin → Customize → Themes → Install → *From a git repository* →
`https://github.com/tachyurgy/discourse-composer-safeguarding`, then add it to your active
theme as a component and edit the settings.

## Testing it

As a non-staff test user below the exempt trust level, open a reply, type one of the trigger
phrases, press Reply. The notice appears; *Go back to my post* returns you to the draft with
nothing posted, *Post anyway* posts as normal. Press Reply again within the cooldown and the
notice stays quiet.

## Limitations, honestly

- Phrase matching is deliberately simple. It will miss paraphrases and it will occasionally fire
  on a quoted lyric. Tune the list from what your moderators actually see; the component is a
  prompt, not a classifier.
- It runs client-side, so it does not cover posts created through the API or by email-in.
- `composerBeforeSave` is a single hook on the composer model. If another theme or plugin on the
  site also registers one, the later registration wins. Disable one or merge them.
- Written against Discourse 3.4+ (component-based modals). Import paths use the
  `discourse/components/…` names, which current Discourse shims to the new `ui-kit` locations.

## Author

[Levelbrook Consulting](https://levelbrook.com/hire/) builds and maintains Discourse
(Rails) deployments, plugins and theme components. MIT licensed. Issues and pull requests
welcome.
