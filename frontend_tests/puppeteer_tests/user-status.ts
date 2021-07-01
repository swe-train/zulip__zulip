import type {Page} from "puppeteer";

import common from "../puppeteer_lib/common";

async function open_set_user_status_modal(page: Page): Promise<void> {
    const buddy_list_menu_icon = "#user_presences .user-list-sidebar-menu-icon";
    await page.hover(buddy_list_menu_icon);
    await page.waitForSelector(buddy_list_menu_icon, {visible: true});
    await page.click(buddy_list_menu_icon);
    await page.waitForSelector(".user_popover", {visible: true});
    // We are using evaluate to click because it is very hard to detect if the user info popover has opened.
    await page.evaluate(() =>
        (document.querySelector(".update_status_text") as HTMLAnchorElement)!.click(),
    );
    await page.waitForSelector("#set_user_status_modal", {visible: true});
}

async function test_user_status(page: Page): Promise<void> {
    await open_set_user_status_modal(page);
    // Check by clicking on common statues.
    await page.click(".user-status-value");
    await page.waitForFunction(
        () => (document.querySelector(".user_status") as HTMLInputElement).value === "In a meeting",
    );
    // It should select calendar emoji.
    await page.waitForSelector(".selected_emoji.emoji-1f4c5");

    // Clear everything.
    await page.click("#clear_status_message_button");
    await page.waitForFunction(
        () => (document.querySelector(".user_status") as HTMLInputElement).value === "",
    );
    await page.waitForSelector(".status_emoji_wrapper .smiley_icon", {visible: true});

    // Manualy adding everthing.
    await page.type(".user_status", "Busy");
    const tada_emoji_selector = ".emoji-1f389";
    await page.click(".status_emoji_wrapper .smiley_icon");
    // Wait until emoji popover is opened.
    await page.waitForSelector(`.emoji-popover  ${tada_emoji_selector}`, {visible: true});
    await page.click(`.emoji-popover  ${tada_emoji_selector}`);
    await page.waitForSelector(".emoji-info-popover", {hidden: true});
    await page.waitForSelector(`.selected_emoji${tada_emoji_selector}`);

    await page.click(".set_user_status");
    // It should close the modal after saving.
    await page.waitForSelector("#set_user_status_modal", {hidden: true});

    // Check if the emoji is added in user presense list.
    await page.waitForSelector(`.user-presence-link .status_emoji${tada_emoji_selector}`);
}

async function user_status_test(page: Page): Promise<void> {
    await common.log_in(page);
    await test_user_status(page);
}

common.run_test(user_status_test);
