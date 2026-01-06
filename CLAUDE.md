# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
pnpm dev          # Start development server with hot reload
pnpm build        # Build for production (Chrome)
pnpm build:firefox # Build for Firefox
pnpm zip          # Create distributable ZIP
```

**Node.js 22+ required** - use `nvm use` to switch to the correct version.

## Project Architecture

- **WXT Framework** with React and TypeScript (Manifest V3)
- **entrypoints/**: Extension entry points (popup, content script, background)
- **src/components/**: React components (OdooOverlay is the main overlay)
- **src/services/**: odoo-client.ts (JSON-RPC), storage.ts (Chrome storage)
- **src/utils/**: odoo-detector.ts (version detection), quicklinks.ts (version-aware URLs)

Key patterns:
- Odoo detection happens via `window.odoo.session_info` and URL hash parsing
- Console logging only on localhost (via `log()` utility)
- Settings persisted via Chrome storage API
- Version-specific quicklinks for Odoo 17 vs 18+

---

# Development of an Chrome Extension

You are a senior Chrome Extension & Odoo 18 developer.
You are building a Chrome Extension (Manifest V3) that significantly improves the daily workflow of Odoo developers.
It is a developer control plane with strong focus on safety, clarity, and productivity. It might be published later on.

# Scope

The extension should help during the development of Odoo 17+ instances on localhost, when in dev-mode. But also on production instances, the extension should work. As a odoo developer, you might have a lot of repetitive tasks during your day. The extension should help by gaining shortcuts, making needed information available or automate tasks where possible.

# User Interface and language

The extension might produce overlays or settings menu, please use an clean ui, maybe there is an common framework especially for chrome extensions. it is allowed to use React, there is a common framework for chrome extensions where you can use react. That is definitely allowed since it raise the quality of code. You are allowed to communicate with the json rpc if you have an active user session. This might be necessary for detecting which reports are available to show if you are on a record form. Use the color scheme from odoo.

# Further requirements

- Use common practices for chrome extensions
- Use a clean, chrome extension common structure of the code
- Write maintainable, modular, extendable code which is performant and non-disturbing on other pages than Odoo if enabled
- You must use WXT Framework with React in the Frontend and TypeScript enabled, follow their best practices
- You must use pnpm for performance reasons
- Take care of error handling and don't spam the console log, but it is allowed to print console logs when odoo is running on localhost
- I will provide the icon set later on, you don't need to take care about that
- All current features should work on localhost and on prod-domains
- You have to check the correct version of Odoo in order to treat links etc. different, because some things have changes from 17 to 18,19 - but we should support 17 as well.
- Some of the features need to be permanently saved in the browser, e.g. if debug mode is auto-enabled.
- You will require to communicate with the json-rpc api of the instance. Take care of different versions here, as well as, the user which is authenticated in the cookies can communicate with the api, but it can fail due to access rights. However, make sure you have a clean extendable structure for those calls, kind of odoo client withtin the chrome extension. There might be other features coming.
- Write a wonderful readme as I might publish the code as public repository on github and might publish the extension on the chrome extension store too. Take care of all requirements.


# Core Features

Feature 1: Enable/disable debug mode (by using the query parameter)
Feature 2: Overlay which shows infos such: Database name, User, Company, Model, Record ID, the name of the current view.
Feature 3: Automatically load all ir.actions.report records for the current model, if model and record id are available
Feature 4: Show Quicklinks to: Settings, Scheduled Actions, Sequences, External IDs, Config
Feature 5: Make current session to super admin session


## Feature 1 Details

The debug mode is handled by a boolean query parameter "debug". There should be switch to set that 0 or 1. I also want other switch where you can define if you immediately wants to switch on debug as soon as you enter an odoo instance. If the user is in deeplinks, take care of setting the debug param to the right position, especially in odoo 17.

## Feature 2 Details

The overlay should show common infos which a developer might need to make decisions or develop some things on the view. On-click: Copy the text.
The overlay position should be configurable in the extension settings (all four corners: top-left, top-right, bottom-left, bottom-right).
The overlay should be minimizable to a small icon/text in the chosen corner. All features (quicklinks, reports) should be accessible from the overlay panel for practicality.

## Feature 3 Details

For example, if I am on a form view of a sale order, you can use the current session and the json rpc to get all available reports from the database. List those reports and provide two views, html and pdf view via those built-in links, e.g. http://localhost:8069/de/report/html/stock.report_deliveryslip/4799.
That should help if you want to quickly view the sale order confirmation, for example, of this record.

# Feature 4 Details

Those links might be hardcoded links for the purpose to not set into those deep settings menu structures all the time. Take care of the correct links between versions 17 and 18/19.

# Feature 5 Details

With a redirect through /web/become the admin session will be converted into a superadmin session. No confirmation dialog needed - direct action.