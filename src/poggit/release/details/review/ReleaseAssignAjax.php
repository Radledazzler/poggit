<?php

/*
 * poggit
 *
 * Copyright (C) 2018 SOFe
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

declare(strict_types=1);

namespace poggit\release\details\review;

use poggit\Meta;
use poggit\module\AjaxModule;
use poggit\utils\internet\Mysql;

class ReleaseAssignAjax extends AjaxModule {
    protected function impl() {
        if(Meta::getAdmlv() < Meta::ADMLV_REVIEWER) $this->errorAccessDenied();
        $releaseId = (int) $this->param("releaseId");
        $assignee = $this->param("assignee");
        Meta::getLog()->w("Release #$releaseId assigned to $assignee");
        Mysql::query("UPDATE releases SET assignee = (SELECT uid FROM users WHERE name = ?) WHERE releaseId = ?", "si", $assignee, $releaseId);
        echo '{}';
    }
}
