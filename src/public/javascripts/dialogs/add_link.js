"use strict";

const addLink = (function() {
    const dialogEl = $("#add-link-dialog");
    const formEl = $("#add-link-form");
    const autoCompleteEl = $("#note-autocomplete");
    const linkTitleEl = $("#link-title");
    const clonePrefixEl = $("#clone-prefix");
    const linkTitleFormGroup = $("#add-link-title-form-group");
    const prefixFormGroup = $("#add-link-prefix-form-group");
    const linkTypeEls = $("input[name='add-link-type']");
    const linkTypeHtmlEl = linkTypeEls.filter('input[value="html"]');

    function setLinkType(linkType) {
        linkTypeEls.each(function () {
            $(this).prop('checked', $(this).val() === linkType);
        });

        linkTypeChanged();
    }

    function showDialog() {
        glob.activeDialog = dialogEl;

        if (noteEditor.getCurrentNoteType() === 'text') {
            linkTypeHtmlEl.prop('disabled', false);

            setLinkType('html');
        }
        else {
            linkTypeHtmlEl.prop('disabled', true);

            setLinkType('selected-to-current');
        }

        dialogEl.dialog({
            modal: true,
            width: 700
        });

        autoCompleteEl.val('').focus();
        clonePrefixEl.val('');
        linkTitleEl.val('');

        function setDefaultLinkTitle(noteId) {
            const noteTitle = noteTree.getNoteTitle(noteId);

            linkTitleEl.val(noteTitle);
        }

        autoCompleteEl.autocomplete({
            source: noteTree.getAutocompleteItems(),
            minLength: 0,
            change: () => {
                const val = autoCompleteEl.val();
                const notePath = link.getNodePathFromLabel(val);
                if (!notePath) {
                    return;
                }

                const noteId = treeUtils.getNoteIdFromNotePath(notePath);

                if (noteId) {
                    setDefaultLinkTitle(noteId);
                }
            },
            // this is called when user goes through autocomplete list with keyboard
            // at this point the item isn't selected yet so we use supplied ui.item to see WHERE the cursor is
            focus: (event, ui) => {
                const notePath = link.getNodePathFromLabel(ui.item.value);
                const noteId = treeUtils.getNoteIdFromNotePath(notePath);

                setDefaultLinkTitle(noteId);
            }
        });
    }

    formEl.submit(() => {
        const value = autoCompleteEl.val();

        const notePath = link.getNodePathFromLabel(value);
        const noteId = treeUtils.getNoteIdFromNotePath(notePath);

        if (notePath) {
            const linkType = $("input[name='add-link-type']:checked").val();

            if (linkType === 'html') {
                const linkTitle = linkTitleEl.val();

                dialogEl.dialog("close");

                link.addLinkToEditor(linkTitle, '#' + notePath);
            }
            else if (linkType === 'selected-to-current') {
                const prefix = clonePrefixEl.val();

                cloning.cloneNoteTo(noteId, noteEditor.getCurrentNoteId(), prefix);

                dialogEl.dialog("close");
            }
            else if (linkType === 'current-to-selected') {
                const prefix = clonePrefixEl.val();

                cloning.cloneNoteTo(noteEditor.getCurrentNoteId(), noteId, prefix);

                dialogEl.dialog("close");
            }
        }

        return false;
    });

    function linkTypeChanged() {
        const value = linkTypeEls.filter(":checked").val();

        if (value === 'html') {
            linkTitleFormGroup.show();
            prefixFormGroup.hide();
        }
        else {
            linkTitleFormGroup.hide();
            prefixFormGroup.show();
        }
    }

    linkTypeEls.change(linkTypeChanged);

    $(document).bind('keydown', 'ctrl+l', e => {
        showDialog();

        e.preventDefault();
    });

    return {
        showDialog
    };
})();