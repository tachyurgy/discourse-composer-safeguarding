import Component from "@glimmer/component";
import { action } from "@ember/object";
import DButton from "discourse/components/d-button";
import DModal from "discourse/components/d-modal";
import { i18n } from "discourse-i18n";

// The notice itself. It is a plain modal: text, a list of resource links, and one or two
// buttons. It resolves the promise the composer is waiting on with { proceed: true|false }.
export default class ComposerSafeguardingModal extends Component {
  @action
  postAnyway() {
    this.args.closeModal({ proceed: true });
  }

  @action
  goBack() {
    this.args.closeModal({ proceed: false });
  }

  <template>
    <DModal
      @title={{@model.title}}
      @closeModal={{this.goBack}}
      @dismissable={{true}}
      class="composer-safeguarding-modal"
    >
      <:body>
        <p class="composer-safeguarding__body">{{@model.body}}</p>
        {{#if @model.resources.length}}
          <p class="composer-safeguarding__intro">
            {{i18n (themePrefix "composer_safeguarding.resources_intro")}}
          </p>
          <ul class="composer-safeguarding__resources">
            {{#each @model.resources as |resource|}}
              <li>
                <a href={{resource.url}} target="_blank" rel="noopener noreferrer">
                  {{resource.label}}
                </a>
              </li>
            {{/each}}
          </ul>
        {{/if}}
      </:body>
      <:footer>
        <DButton
          @action={{this.goBack}}
          @translatedLabel={{@model.goBackLabel}}
          class="btn-primary composer-safeguarding__go-back"
        />
        {{#if @model.allowPostAnyway}}
          <DButton
            @action={{this.postAnyway}}
            @translatedLabel={{@model.postAnywayLabel}}
            class="btn-flat composer-safeguarding__post-anyway"
          />
        {{/if}}
      </:footer>
    </DModal>
  </template>
}
