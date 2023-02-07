/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, {
  FunctionComponent,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { Modal } from 'antd';
import { styled, t, SupersetClient } from '@superset-ui/core';
import { FormLabel } from 'src/components/Form';
import Icons from 'src/components/Icons';
import DatabaseSelector, {
  DatabaseObject,
} from 'src/components/DatabaseSelector';
import TemplateSelector from 'src/components/TemplateSelector';
import Button from 'src/components/Button';
import { Input } from 'src/components/Input';
import CertifiedBadge from 'src/components/CertifiedBadge';
import WarningIconWithTooltip from 'src/components/WarningIconWithTooltip';
import { useToasts } from 'src/components/MessageToasts/withToasts';
import { SchemaOption } from 'src/SqlLab/types';
import { useTables, Table } from 'src/hooks/apiResources';
import Validator from 'src/SqlLab/actions/Validator';

const REFRESH_WIDTH = 30;

const TableSelectorWrapper = styled.div`
  ${({ theme }) => `
    .refresh {
      display: flex;
      align-items: center;
      width: ${REFRESH_WIDTH}px;
      margin-left: ${theme.gridUnit}px;
      margin-top: ${theme.gridUnit * 5}px;
    }

    .section {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .input {
      width: calc(100% - 30px - ${theme.gridUnit}px);
      flex: 1;
    }
    .divider {
      border-bottom: 1px solid ${theme.colors.secondary.light5};
      margin: 15px 0;
    }
    .table-length {
      color: ${theme.colors.grayscale.light1};
    }
    .select {
      flex: 1;
      max-width: calc(100% - ${theme.gridUnit + REFRESH_WIDTH}px)
    }
    & > div {
      margin-bottom: ${theme.gridUnit * 4}px;
    }
  `}
`;

const TableLabel = styled.span`
  align-items: center;
  display: flex;
  white-space: nowrap;

  svg,
  small {
    margin-right: ${({ theme }) => theme.gridUnit}px;
  }
`;

interface TableSelectorProps {
  clearable?: boolean;
  database?: DatabaseObject | null;
  emptyState?: ReactNode;
  formMode?: boolean;
  getDbList?: (arg0: any) => {};
  handleError: (msg: string) => void;
  isDatabaseSelectEnabled?: boolean;
  onDbChange?: (db: DatabaseObject) => void;
  onSchemaChange?: (schema?: string) => void;
  onSchemasLoad?: (schemaOptions: SchemaOption[]) => void;
  onTablesLoad?: (options: Array<any>) => void;
  readOnly?: boolean;
  schema?: string;
  onEmptyResults?: (searchText?: string) => void;
  sqlLabMode?: boolean;
  tableValue?: string | string[];
  onTableSelectChange?: (value?: string | string[], schema?: string) => void;
  tableSelectMode?: 'single' | 'multiple';
}

export interface TableOption {
  label: JSX.Element;
  text: string;
  value: string;
}

export const TableOption = ({ table }: { table: Table }) => {
  const { value, type, extra } = table;
  return (
    <TableLabel title={value}>
      {type === 'view' ? (
        <Icons.Eye iconSize="m" />
      ) : (
        <Icons.Table iconSize="m" />
      )}
      {extra?.certification && (
        <CertifiedBadge
          certifiedBy={extra.certification.certified_by}
          details={extra.certification.details}
          size="l"
        />
      )}
      {extra?.warning_markdown && (
        <WarningIconWithTooltip
          warningMarkdown={extra.warning_markdown}
          size="l"
        />
      )}
      {value}
    </TableLabel>
  );
};

const TableSelector: FunctionComponent<TableSelectorProps> = ({
  database,
  emptyState,
  formMode = false,
  getDbList,
  handleError,
  isDatabaseSelectEnabled = true,
  onDbChange,
  onSchemaChange,
  onSchemasLoad,
  readOnly = false,
  onEmptyResults,
  schema,
  sqlLabMode = true,
}) => {
  const { addSuccessToast } = useToasts();
  const [currentSchema, setCurrentSchema] = useState<string | undefined>(
    schema,
  );

  useEffect(() => {
    if (database === undefined) {
      setCurrentSchema(undefined);
    }
  }, [database]);

  const internalDbChange = (db: DatabaseObject) => {
    if (onDbChange) {
      onDbChange(db);
    }
  };

  const internalSchemaChange = (schema?: string) => {
    setCurrentSchema(schema);
    if (onSchemaChange) {
      onSchemaChange(schema);
    }
  };

  function renderDatabaseSelector() {
    return (
      <DatabaseSelector
        db={database}
        emptyState={emptyState}
        formMode={formMode}
        getDbList={getDbList}
        handleError={handleError}
        onDbChange={readOnly ? undefined : internalDbChange}
        onEmptyResults={onEmptyResults}
        onSchemaChange={readOnly ? undefined : internalSchemaChange}
        onSchemasLoad={onSchemasLoad}
        schema={currentSchema}
        sqlLabMode={sqlLabMode}
        isDatabaseSelectEnabled={isDatabaseSelectEnabled && !readOnly}
        readOnly={readOnly}
      />
    );
  }

  const [buttonLoading, setButtonLoading] = useState(false);
  const [params, setParams] = useState({});
  const [template_id, setTemplateId] = useState('');
  const [dataset_name, setDatasetName] = useState('');
  const [datasetId, setDatasetId] = useState(null);

  function postTemplateParamsData(payload: object) {
    const modal = Modal.info({
      content: 'Generating dataset ... ...',
      okButtonProps: {
        disabled: true,
        loading: true,
      },
      okText: 'chart',
    });
    return SupersetClient.post({
      url: 'http://192.168.8.69:5000/api/dataset',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(({ json }) => {
        setButtonLoading(false);
        const { dataset_id: datasetId } = json;
        setDatasetId(datasetId);
        modal.update({
          content: 'Dataset created successfully',
          okButtonProps: {
            disabled: false,
            loading: false,
          },
          okText: 'chart',
          onOk: () => {
            handleOk();
          },
        });
      })
      .catch(e => {
        setButtonLoading(false);
        modal.update({
          content: 'Failed to create dataset.',
          okButtonProps: {
            disabled: false,
            loading: false,
          },
          okText: 'cancel',
        });
      });
  }
  function handleOk() {
    window.open(
      `/explore/?datasource_id=${datasetId}&dataset_type=table&dataset_id=${datasetId}&datasource_type=table`,
      '_blank',
      'noreferrer',
    );
  }

  function createDataset() {
    setButtonLoading(true);
    const validator = new Validator();
    validator.add(dataset_name, 'isNonEmpty', 'dataset name 不能为空');
    validator.add(currentSchema, 'isNonEmpty', '请选择Schema');
    validator.add(database?.id, 'isNonEmpty', '请选择数据库');
    const errMsg = validator.start();
    if (errMsg) {
      Modal.confirm({
        content: errMsg,
      });
      return;
    }
    postTemplateParamsData({
      database: database?.id,
      schema: currentSchema,
      params,
      template_id,
      dataset_name,
    });
  }
  function onParamsChange(params: Object) {
    setParams(params);
  }
  function onTemplateChange(id: string) {
    setTemplateId(id);
  }

  function renderInputRow(input: ReactNode, label: string) {
    return (
      <>
        <FormLabel>{label}</FormLabel>
        <div className="section">
          <span className="input">{input}</span>
          <span className="refresh" />
        </div>
      </>
    );
  }
  function DatasetNameChange(value: string) {
    if (value) {
      setDatasetName(value);
    }
  }

  return (
    <TableSelectorWrapper>
      {renderDatabaseSelector()}
      {sqlLabMode && !formMode && <div className="divider" />}
      <TemplateSelector
        onParamsChange={onParamsChange}
        onTemplateChange={onTemplateChange}
        handleError={handleError}
      />
      {renderInputRow(
        <Input
          placeholder={t('Dataset name')}
          onChange={e => {
            DatasetNameChange(e.target.value);
          }}
        />,
        'dataset name',
      )}
      <Button
        block
        disabled={buttonLoading}
        loading={buttonLoading}
        onClick={createDataset}
      >
        RUN
      </Button>
    </TableSelectorWrapper>
  );
};

export const TableSelectorMultiple: FunctionComponent<
  TableSelectorProps
> = props => <TableSelector tableSelectMode="multiple" {...props} />;

export default TableSelector;
