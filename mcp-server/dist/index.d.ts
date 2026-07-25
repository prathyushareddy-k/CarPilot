#!/usr/bin/env node
/**
 * MCP Server for Lot Agent — Car Shortlisting
 *
 * Exposes three tools:
 *   car_list_all      List every car in the database with optional filters.
 *   car_shortlist     Score and rank cars against user preferences.
 *   car_get_detail    Return full details for a single car by ID.
 *
 * Run via stdio (Claude Desktop / Claude Code MCP config):
 *   node dist/index.js
 *
 * Requires DATABASE_URL in the environment.
 */
export {};
