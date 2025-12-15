# Architecture Overview — BC3js

## 1. Purpose

BC3js aims to parse FIEBDC-3 / BC3 files and produce a strongly-typed
hierarchical in-memory model.

## 2. High-Level Design

- Composite pattern → domain tree
- Strategy → record parsers (~V, ~C, ~D...)
- Builder → incremental document assembly
- Facade → BC3.parse()

## 3. Modules (planned)

- parser/
- builder/
- model/
- core/
- utils/

## 4. Workflow

BC3 file → LineTokenizer → RecordDispatcher → Strategy parsers → DocumentBuilder → Bc3Document.
