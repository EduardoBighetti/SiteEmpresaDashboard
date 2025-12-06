# Guia Completo: Arduino + Node.js + MySQL + React

Este arquivo contém o código necessário para o Backend (API) e para o Microcontrolador (Arduino/ESP32).

## 1. Banco de Dados (MySQL)

Execute este SQL para criar as tabelas necessárias:

```sql
CREATE DATABASE IF NOT EXISTS al2_iot;
USE al2_iot;

-- Tabela de Usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Sensores
CREATE TABLE sensors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(50) NOT NULL UNIQUE, -- ID físico do ESP32 ou Token
    name VARCHAR(100),
    user_id INT, -- Opcional: para vincular sensor a usuario
    last_seen TIMESTAMP NULL,
    status ENUM('active', 'offline') DEFAULT 'offline',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Leituras
CREATE TABLE readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id INT NOT NULL,
    temperature FLOAT,
    humidity FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE
);
```

---

## 2. Backend (Node.js)

Adicione estas rotas ao seu arquivo `server.js` existente. 

**Dependências necessárias:**
`npm install express mysql2 bcrypt cors express-session`

### Novo Endpoint: Receber dados do Arduino

```javascript
// ... configurações existentes do express ...

// Endpoint para o Arduino enviar dados (POST)
// O Arduino deve enviar JSON: { "identifier": "ESP32-001", "temperature": 25.5, "humidity": 60 }
app.post('/api/arduino/data', async (req, res) => {
    const { identifier, temperature, humidity } = req.body;

    if (!identifier || temperature === undefined) {
        return res.status(400).json({ message: "Dados inválidos" });
    }

    try {
        // 1. Verifica se o sensor existe
        const [sensors] = await pool.query('SELECT id FROM sensors WHERE identifier = ?', [identifier]);
        
        let sensorId;
        
        if (sensors.length === 0) {
            // Opcional: Auto-cadastrar sensor se não existir
            const [newSensor] = await pool.query('INSERT INTO sensors (identifier, name, status, last_seen) VALUES (?, ?, ?, NOW())', [identifier, 'Novo Sensor', 'active']);
            sensorId = newSensor.insertId;
        } else {
            sensorId = sensors[0].id;
            // Atualiza status e last_seen
            await pool.query('UPDATE sensors SET status = "active", last_seen = NOW() WHERE id = ?', [sensorId]);
        }

        // 2. Salva a leitura
        await pool.query('INSERT INTO readings (sensor_id, temperature, humidity) VALUES (?, ?, ?)', [sensorId, temperature, humidity]);

        res.status(200).send("OK");
    } catch (error) {
        console.error("Erro no endpoint Arduino:", error);
        res.status(500).send("Erro interno");
    }
});

// Endpoint para listar sensores (Para o Site)
app.get('/api/sensors', requireLogin, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM sensors');
        res.json(rows);
    } catch (err) {
        res.status(500).json({message: "Erro ao buscar sensores"});
    }
});

// Endpoint para criar sensor manualmente (Para o Site)
app.post('/api/sensors', requireLogin, async (req, res) => {
    const { identifier, name } = req.body;
    try {
        await pool.query('INSERT INTO sensors (identifier, name) VALUES (?, ?)', [identifier, name]);
        res.json({ identifier, name, status: 'offline' });
    } catch (err) {
        res.status(500).json({message: "Erro ao criar sensor"});
    }
});
```

---

## 3. Código Arduino (ESP32 / ESP8266)

Este código assume que você está usando um ESP32 e um sensor DHT11/DHT22.

**Bibliotecas necessárias (Instalar via Library Manager):**
1. `DHT sensor library` (por Adafruit)
2. `ArduinoJson` (Versão 6 ou 7)

```cpp
#include <WiFi.h> // Use <ESP8266WiFi.h> se for ESP8266
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// --- Configurações ---
const char* ssid = "NOME_DA_SUA_WIFI";
const char* password = "SENHA_DA_SUA_WIFI";

// IP do seu servidor (Se rodar local, use o IP da máquina, ex: 192.168.1.100)
// Não use "localhost" no Arduino
const char* serverUrl = "http://192.168.1.100:3000/api/arduino/data";

// Identificador único deste dispositivo
const char* deviceId = "ESP32-LAB-01"; 

#define DHTPIN 4      // Pino onde o sensor está conectado
#define DHTTYPE DHT11 // DHT 11 ou DHT 22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();

  WiFi.begin(ssid, password);
  Serial.println("Conectando ao WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado!");
}

void loop() {
  // Aguarda 30 segundos entre leituras
  delay(30000);

  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("Falha ao ler do sensor DHT!");
    return;
  }

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Cria o JSON
    StaticJsonDocument<200> doc;
    doc["identifier"] = deviceId;
    doc["temperature"] = t;
    doc["humidity"] = h;

    String requestBody;
    serializeJson(doc, requestBody);

    // Envia POST
    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
    } else {
      Serial.print("Erro no envio: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi desconectado");
  }
}
```

## Resumo do Fluxo

1.  **Arduino:** Lê temperatura/umidade e envia POST para `http://seu-ip:3000/api/arduino/data`.
2.  **Backend:** Recebe o POST, verifica o ID do sensor e salva no MySQL.
3.  **Frontend (React):** A cada 30 segundos, chama `/api/readings` para atualizar o gráfico.
