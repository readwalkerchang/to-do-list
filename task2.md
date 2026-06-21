# Task 2

## 作業一：拯救明華國小的資料庫

題目：哪個欄位適合變成外來鍵？

| 學生編號 | 姓名 | 班級 | 性別 | 年齡 |
| --- | --- | --- | --- | --- |
| 1 | 小明 | 三年一班 | 男 | 8 |
| 2 | 小華 | 三年二班 | 女 | 9 |
| 3 | 小美 | 三年一班 | 男 | 8 |
| 4 | 小強 | 三年一班 | 女 | 8 |
| 5 | 小智 | 三年二班 | 男 | 9 |

學生的班級適合用來做 foreign key，那是因為班級可以是一個獨立的實體，擁有自己的資料。

如果我們把班級拆出來，在原本的資料表中改用「班級編號」來對應，就可以對應到它是幾年幾班。這樣一來，班級就能成為一個獨立的資料表，裡面可以包含：
1. 班級編號
2. 班級名稱
3. 班級老師
4. 班級位置（例如在幾樓）

#### 建立外來鍵資料表
```sql
CREATE TABLE classes(
   id SERIAL PRIMARY KEY,
   name VARCHAR(20)
);
```

#### 建立主資料表
```sql
CREATE TABLE students(
   id SERIAL PRIMARY KEY,
   name VARCHAR(10),
   classroom_id INTEGER,
   gender VARCHAR(10),
   age INTEGER,
   FOREIGN KEY(classroom_id) REFERENCES classes(id)
);
```

#### 新增資料
```sql
INSERT INTO classes (id, name)
VALUES
  (1, '三年一班'),
  (2, '三年二班');

INSERT INTO students (id, name, classroom_id, gender, age)
VALUES
  (1, '小明', 1, '男', 8),
  (2, '小華', 2, '女', 9),
  (3, '小美', 1, '男', 8),
  (4, '小強', 1, '女', 8),
  (5, '小智', 2, '男', 9);
```

#### 查詢資料
```sql
SELECT 
   students.id AS 學生編號,
   students.name AS 姓名,
   classes.name AS 班級,
   students.gender AS 性別,
   students.age AS 年齡
FROM students
INNER JOIN classes ON students.classroom_id = classes.id;
```

## 作業二：第一題的延伸，多了一個班級老師

題目：哪個欄位適合變成外來鍵？應該如何拆成不同資料表？

| 學生編號 | 姓名 | 班級 | 班級老師 | 性別 | 年齡 |
| --- | --- | --- | --- | --- | --- |
| 1 | 小明 | 三年一班 | 廖洧杰 | 男 | 8 |
| 2 | 小華 | 三年二班 | 卡斯伯 | 女 | 9 |
| 3 | 小美 | 三年一班 | 查理 | 男 | 8 |
| 4 | 小強 | 三年一班 | 麥可 | 女 | 8 |
| 5 | 小智 | 三年二班 | 李燕容 | 男 | 9 |

班級這個欄位比較適合拆成獨立的資料表，因為同一個班級會重複出現在很多學生資料中。

我們可以建立一張班級資料表，使用 class_id 作為主鍵，並把班級名稱和班級老師都放在這張表裡。學生資料表則保留 class_id，作為 foreign key 去對應班級資料表。

舉例來說，如果有 30 個學生都屬於「三年一班」，那麼學生資料表只需要重複記錄同一個 class_id，不需要每一筆都重新寫一次「三年一班」和班級老師姓名。這樣就可以透過 class_id 查到對應的班級名稱與班級老師，減少重複資料，也比較方便管理。

#### 建立外來鍵資料表
```sql
CREATE TABLE classes(
   id SERIAL PRIMARY KEY,
   name VARCHAR(20),
   teacher VARCHAR(20)
);
```

#### 建立主資料表
```sql
//和第一題相同

```

#### 新增資料
```sql
//新增學生資料和第一題相同，故省略

INSERT INTO classes (id, name, teacher)
VALUES
  (1, '三年一班', 張老師),
  (2, '三年二班', 陳老師);

```

#### 查詢資料
```sql
SELECT 
   students.id AS 學生編號,
   students.name AS 姓名,
   classes.name AS 班級,
   classes.teacher AS 老師,
   students.gender AS 性別,
   students.age AS 年齡
FROM students
INNER JOIN classes ON students.classroom_id = classes.id;

```

## 作業三：小孩的家庭歸類資料庫

題目：父母資料一直重複實在討厭，哪個欄位適合變成外來鍵？應該如何拆成不同資料表？

| 小孩編號 | 姓名 | 父母名稱 | 父母電話 | 父母性別 |
| --- | --- | --- | --- | --- |
| 1 | 小明 | 王大祥 | 0973254254 | 男 |
| 2 | 小華 | 王曉如 | 0955717855 | 女 |
| 3 | 小美 | 王大祥 | 0973254254 | 男 |
| 4 | 小強 | 王曉如 | 0955717855 | 女 |
| 5 | 小智 | 王大祥 | 0973254254 | 男 |

父母資料一直重複，因此可以將父母名稱、電話和性別拆到獨立的家長資料表。小孩和家長都使用自己的 primary key，避免因為同名同姓而無法分辨資料。

一個小孩可能對應多位家長，一位家長也可能對應多個小孩，因此小孩與家長是 many-to-many 的關係。這種關係不能只在其中一張表放一個 foreign key，而是需要使用 `child_guardian` 中介表記錄雙方的 ID。

資料表拆分方式如下：
1. `children` 儲存小孩編號與姓名。
2. `guardians` 儲存家長編號、姓名、電話與性別。
3. `child_guardian` 使用 `child_id` 和 `guardian_id` 作為 foreign key，記錄小孩與家長的對應關係。

#### 建立家長資料表
```sql
CREATE TABLE guardians (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20),
  phone VARCHAR(20),
  gender VARCHAR(10)
);
```

#### 建立小孩與關聯資料表
```sql
CREATE TABLE children (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20)
);

CREATE TABLE child_guardian (
  child_id INTEGER,
  guardian_id INTEGER,
  PRIMARY KEY (child_id, guardian_id),
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (guardian_id) REFERENCES guardians(id)
);
```

#### 新增資料
```sql
INSERT INTO guardians (name, phone, gender)
VALUES
  ('王大祥', '0973254254', '男'),
  ('王曉如', '0955717855', '女');

INSERT INTO children (name)
VALUES
  ('小明'),
  ('小華'),
  ('小美'),
  ('小強'),
  ('小智');

INSERT INTO child_guardian (child_id, guardian_id)
VALUES
  (1, 1),
  (2, 2),
  (3, 1),
  (4, 2),
  (5, 1);
```

#### 查詢資料
```sql
SELECT 
  children.id AS 小孩編號,
  children.name AS 姓名,
  guardians.name AS 父母名稱,
  guardians.phone AS 父母電話,
  guardians.gender AS 父母性別
FROM children
INNER JOIN child_guardian ON children.id = child_guardian.child_id
INNER JOIN guardians ON child_guardian.guardian_id = guardians.id;
```
